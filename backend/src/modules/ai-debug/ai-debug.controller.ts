import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebhookEvent } from '../webhooks/webhooks.model';
import { ApiRequest } from '../api-requests/api-requests.model';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { ApiError } from '../../shared/utils/ApiError';
import { ENV } from '../../env';

type EventType = 'webhook' | 'api_request';

interface DebugPromptBody {
  type: EventType;
  eventId: string;
}

/**
 * Masks Authorization header values for safe display.
 * "Bearer sk_live_abc123" → "Bearer ***"
 */
const sanitizeHeaders = (
  headers: Record<string, string>
): Record<string, string> => {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'authorization') {
      // Preserve scheme (e.g. "Bearer") but mask the token
      const parts = value.split(' ');
      sanitized[key] = parts.length > 1 ? `${parts[0]} ***` : '***';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const safeStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

/**
 * Constructs a structured debug prompt from an event.
 */
const buildPrompt = async (type: EventType, eventId: string): Promise<string> => {
  if (type === 'webhook') {
    const event = await WebhookEvent.findOne({ id: eventId }).exec();
    if (!event) {
      throw new ApiError(404, `Webhook event not found: ${eventId}`);
    }

    const sanitizedHeaders = sanitizeHeaders(event.headers);

    return `[SYSTEM INTENT]
You are an expert Node.js diagnostic assistant. Analyze the following webhook delivery failure to a backend target (BACKEND_TARGET_URL) and isolate the root cause.

[TECHNICAL CONTEXT]
- Source: ${event.source}
- Method: ${event.method}
- Target URL: ${event.url}
- Response Status: ${event.status} (${event.responseTime}ms)

[REQUEST DATA]
Headers:
${safeStringify(sanitizedHeaders)}

Payload:
${safeStringify(event.payload)}

[ACTION REQUIRED]
1. Identify the specific invalid field, missing header, or configuration error causing the failure.
2. Provide a clear explanation of what the developer needs to do to configure or fix this issue.
3. Output ONLY the analysis and fix explanation in markdown. No conversational filler, greetings, or conclusions.
4. DO NOT provide any actual code or exact code snippets. Just explain how to check and solve the problem.`;
  }

  const apiReq = await ApiRequest.findOne({ id: eventId }).exec();
  if (!apiReq) {
    throw new ApiError(404, `API request not found: ${eventId}`);
  }

  const sanitizedHeaders = sanitizeHeaders(apiReq.requestHeaders);

  return `[SYSTEM INTENT]
You are an expert Node.js diagnostic assistant. Diagnose a failed outbound API request to a payment provider.

[TECHNICAL CONTEXT]
- Service: ${apiReq.service}
- Endpoint: ${apiReq.endpoint}
- Method: ${apiReq.method}
- Response Status: ${apiReq.responseStatus} (${apiReq.responseTime}ms)

[REQUEST DATA]
Headers:
${safeStringify(sanitizedHeaders)}

Payload:
${safeStringify(apiReq.requestPayload)}

[PROVIDER RESPONSE]
${safeStringify(apiReq.responseBody)}

[ACTION REQUIRED]
1. Pinpoint the root cause of the failure based on the provider's response and the sent request.
2. Provide a clear explanation of what the developer needs to change in their payload or configuration to fix this issue.
3. Output ONLY the analysis and fix explanation in markdown. No conversational filler, greetings, or conclusions.
4. DO NOT provide any actual code or exact code snippets. Just explain how to check and solve the problem.`;
};

/**
 * POST /api/ai-debug/prompt
 * Generates a structured debug prompt from a failed event.
 */
export const generateDebugPrompt = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { type, eventId } = req.body as DebugPromptBody;

    if (!type || !eventId) {
      throw new ApiError(400, 'type and eventId are required');
    }

    if (type !== 'webhook' && type !== 'api_request') {
      throw new ApiError(400, 'type must be "webhook" or "api_request"');
    }

    const prompt = await buildPrompt(type, eventId);

    res.status(200).json(
      new ApiResponse(200, 'Debug prompt generated', { prompt }).toJSON()
    );
  }
);

/**
 * POST /api/ai-debug/stream
 * Streams an AI-generated debug analysis using Gemini via SSE.
 */
export const streamDebug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { type, eventId } = req.body as DebugPromptBody;

    if (!type || !eventId) {
      throw new ApiError(400, 'type and eventId are required');
    }

    if (type !== 'webhook' && type !== 'api_request') {
      throw new ApiError(400, 'type must be "webhook" or "api_request"');
    }

    if (!ENV.GEMINI_API_KEY) {
      throw new ApiError(
        501,
        'GEMINI_API_KEY is not configured. Add it to your .env file.'
      );
    }

    const prompt = await buildPrompt(type, eventId);

    // Configure SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
);
