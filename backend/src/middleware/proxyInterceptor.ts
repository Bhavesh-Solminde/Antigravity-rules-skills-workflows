import http from 'http';
import https from 'https';
import { URL } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';
import { ApiRequest, IApiRequest } from '../modules/api-requests/api-requests.model';
import { getIO } from '../shared/socket';
import { parseSource } from '../shared/parseSource';

/**
 * URLs containing any of these substrings are excluded from interception.
 * This prevents logging MongoDB driver traffic, Socket.io internals,
 * the DevProxy frontend, and the DevProxy API itself.
 */
const EXCLUDED_PATTERNS = [
  'mongodb',
  'mongo',
  '127.0.0.1',
  'localhost',
  'socket.io',
  'generativelanguage.googleapis.com',
];

/**
 * When true, the interceptor will pass requests through without logging.
 * Used by the proxy controller to avoid double-saving manual dispatches.
 */
let skipInterception = false;

export const setSkipInterception = (value: boolean): void => {
  skipInterception = value;
};

const shouldExclude = (url: string): boolean =>
  skipInterception || EXCLUDED_PATTERNS.some((pattern) => url.toLowerCase().includes(pattern));

/**
 * Collects the full body from a readable stream.
 */
const collectBody = (stream: NodeJS.ReadableStream): Promise<string> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', () => resolve(''));
  });

const safeParse = (raw: string): Record<string, unknown> | string => {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return raw;
  }
};

type RequestFn = typeof http.request;

/**
 * Wraps the native `http.request` / `https.request` so every outgoing
 * call is captured, persisted to MongoDB, and broadcast via Socket.io.
 */
const wrapRequest = (original: RequestFn, protocol: string): RequestFn => {
  const wrapped = function (
    this: unknown,
    ...args: unknown[]
  ): http.ClientRequest {
    /* ---- resolve the URL string ---- */
    let urlStr = '';
    let options: http.RequestOptions = {};

    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      urlStr = firstArg;
      if (typeof args[1] === 'object' && args[1] !== null && !('on' in args[1])) {
        options = args[1] as http.RequestOptions;
      }
    } else if (firstArg instanceof URL) {
      urlStr = firstArg.toString();
      if (typeof args[1] === 'object' && args[1] !== null && !('on' in args[1])) {
        options = args[1] as http.RequestOptions;
      }
    } else if (typeof firstArg === 'object' && firstArg !== null) {
      options = firstArg as http.RequestOptions;
      const host = (options.hostname || options.host || 'localhost') as string;
      const port = options.port ? `:${options.port}` : '';
      urlStr = `${protocol}://${host}${port}${options.path || '/'}`;
    }

    if (shouldExclude(urlStr)) {
      return original.apply(this, args as never) as http.ClientRequest;
    }

    const method = ((options.method || 'GET') as string).toUpperCase();
    const startTime = performance.now();
    const requestBodyChunks: Buffer[] = [];

    /* ---- call the real request ---- */
    const clientReq = original.apply(this, args as never) as http.ClientRequest;

    /* ---- intercept outgoing body ---- */
    const originalWrite = clientReq.write.bind(clientReq);
    clientReq.write = function (
      chunk: unknown,
      ...rest: unknown[]
    ): boolean {
      if (chunk) {
        requestBodyChunks.push(
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        );
      }
      return (originalWrite as Function)(chunk, ...rest);
    };

    const originalEnd = clientReq.end.bind(clientReq);
    clientReq.end = function (
      chunk?: unknown,
      ...rest: unknown[]
    ): http.ClientRequest {
      if (chunk && typeof chunk !== 'function') {
        requestBodyChunks.push(
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        );
      }
      return (originalEnd as Function)(chunk, ...rest);
    };

    /* ---- intercept the response ---- */
    clientReq.on('response', (res: http.IncomingMessage) => {
      collectBody(res).then(async (responseRaw) => {
        const latency = Math.round(performance.now() - startTime);
        const requestRaw = Buffer.concat(requestBodyChunks).toString('utf-8');
        const requestHeaders: Record<string, string> = {};

        const rawHeaders = clientReq.getHeaders();
        for (const [k, v] of Object.entries(rawHeaders)) {
          requestHeaders[k] = Array.isArray(v) ? v.join(', ') : String(v ?? '');
        }

        const { source: service } = parseSource(urlStr, requestHeaders, safeParse(requestRaw));

        const doc: IApiRequest = {
          id: uuidv4(),
          method,
          endpoint: urlStr,
          requestHeaders,
          requestPayload: safeParse(requestRaw),
          responseStatus: res.statusCode ?? 0,
          responseBody: safeParse(responseRaw),
          responseTime: latency,
          timestamp: new Date(),
          failed: (res.statusCode ?? 0) >= 400,
          service,
          source: 'auto',
        };

        try {
          const saved = await new ApiRequest(doc).save();
          const io = getIO();
          io.emit('new_api_request', saved.toObject());
        } catch {
          // Silently ignore persistence errors to avoid crashing the host app
        }
      });
    });

    return clientReq;
  };

  return wrapped as unknown as RequestFn;
};

/**
 * Call once at server startup to install the interceptor.
 * Must be called AFTER `initSocket()` so `getIO()` is available.
 */
export const installProxyInterceptor = (): void => {
  http.request = wrapRequest(http.request, 'http');
  https.request = wrapRequest(https.request, 'https');
  console.log('🔍 Proxy interceptor installed — capturing outgoing HTTP traffic');
};
