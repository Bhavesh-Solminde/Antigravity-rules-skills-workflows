import { Request, Response } from 'express';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ApiRequest, IApiRequest } from './api-requests.model';
import { getIO } from '../../shared/socket';
import { parseSource } from '../../shared/parseSource';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { ApiError } from '../../shared/utils/ApiError';
import { setSkipInterception } from '../../middleware/proxyInterceptor';

interface ProxyRequestBody {
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  payload?: Record<string, unknown> | string;
  source?: 'auto' | 'manual';
}

/**
 * POST /api/api-requests/proxy
 * Proxies a request to an external API (Razorpay/Stripe),
 * logs it, and returns the response.
 */
export const proxyApiRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { method, endpoint, headers, payload } = req.body as ProxyRequestBody;

    if (!method || !endpoint) {
      throw new ApiError(400, 'method and endpoint are required');
    }

    const { source: service } = parseSource(endpoint, headers, payload);
    const startTime = Date.now();

    let responseStatus = 503;
    let responseBody: Record<string, unknown> | string = {};
    let responseTime = 0;

    try {
      const axiosConfig: AxiosRequestConfig = {
        method: method as AxiosRequestConfig['method'],
        url: endpoint,
        headers: headers ?? {},
        data: payload,
        validateStatus: () => true,
      };

      setSkipInterception(true);
      const externalResponse = await axios(axiosConfig);
      setSkipInterception(false);
      responseStatus = externalResponse.status;
      responseTime = Date.now() - startTime;
      responseBody = externalResponse.data as Record<string, unknown> | string;
    } catch (error) {
      setSkipInterception(false);
      responseTime = Date.now() - startTime;
      if (error instanceof AxiosError) {
        responseStatus = error.response?.status ?? 503;
        responseBody = (error.response?.data as Record<string, unknown> | string) ?? { error: error.message };
      } else if (error instanceof Error) {
        responseBody = { error: error.message };
      }
    }

    const apiRequestDoc: IApiRequest = {
      id: uuidv4(),
      method: method.toUpperCase(),
      endpoint,
      requestHeaders: headers ?? {},
      requestPayload: payload ?? {},
      responseStatus,
      responseBody,
      responseTime,
      timestamp: new Date(),
      failed: responseStatus >= 400,
      service,
      source: (req.body as ProxyRequestBody).source || 'manual',
    };

    const savedRequest = await new ApiRequest(apiRequestDoc).save();

    const io = getIO();
    io.emit('new_api_request', savedRequest.toObject());

    res.status(200).json(
      new ApiResponse(200, 'API request proxied successfully', {
        request: savedRequest,
        response: {
          status: responseStatus,
          body: responseBody,
        },
      }).toJSON()
    );
  }
);

/**
 * GET /api/api-requests
 * Returns all API request logs, with optional filtering.
 * Query params: ?service=razorpay&failed=true&limit=50
 */
export const getAllApiRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { service, failed, limit } = req.query;

    const filter: Record<string, unknown> = {};
    if (service && typeof service === 'string') {
      filter.service = service;
    }
    if (failed !== undefined && typeof failed === 'string') {
      filter.failed = failed === 'true';
    }

    const queryLimit = limit && typeof limit === 'string' ? parseInt(limit, 10) : 100;

    const requests = await ApiRequest.find(filter)
      .sort({ timestamp: -1 })
      .limit(queryLimit)
      .exec();

    res.status(200).json(
      new ApiResponse(200, 'API requests retrieved', requests).toJSON()
    );
  }
);

/**
 * GET /api/api-requests/:id
 * Returns a single API request by uuid.
 */
export const getApiRequestById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const apiReq = await ApiRequest.findOne({ id: req.params.id }).exec();

    if (!apiReq) {
      throw new ApiError(404, `API request not found: ${req.params.id}`);
    }

    res.status(200).json(
      new ApiResponse(200, 'API request retrieved', apiReq).toJSON()
    );
  }
);

/**
 * POST /api/api-requests/:id/replay
 * Re-forwards a stored API request to the same external endpoint.
 */
export const replayApiRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const original = await ApiRequest.findOne({ id: req.params.id }).exec();

    if (!original) {
      throw new ApiError(404, `API request not found: ${req.params.id}`);
    }

    const startTime = Date.now();
    let responseStatus = 503;
    let responseBody: Record<string, unknown> | string = {};
    let responseTime = 0;

    try {
      const axiosConfig: AxiosRequestConfig = {
        method: original.method as AxiosRequestConfig['method'],
        url: original.endpoint,
        headers: original.requestHeaders,
        data: original.requestPayload,
        validateStatus: () => true,
      };

      setSkipInterception(true);
      const externalResponse = await axios(axiosConfig);
      setSkipInterception(false);
      responseStatus = externalResponse.status;
      responseTime = Date.now() - startTime;
      responseBody = externalResponse.data as Record<string, unknown> | string;
    } catch (error) {
      setSkipInterception(false);
      responseTime = Date.now() - startTime;
      if (error instanceof AxiosError) {
        responseStatus = error.response?.status ?? 503;
        responseBody = (error.response?.data as Record<string, unknown> | string) ?? { error: error.message };
      } else if (error instanceof Error) {
        responseBody = { error: error.message };
      }
    }

    const replayedRequest: IApiRequest = {
      id: uuidv4(),
      method: original.method,
      endpoint: original.endpoint,
      requestHeaders: original.requestHeaders,
      requestPayload: original.requestPayload,
      responseStatus,
      responseBody,
      responseTime,
      timestamp: new Date(),
      failed: responseStatus >= 400,
      service: original.service,
      source: 'manual',
    };

    const savedRequest = await new ApiRequest(replayedRequest).save();

    const io = getIO();
    io.emit('new_api_request', savedRequest.toObject());

    res.status(200).json(
      new ApiResponse(200, 'API request replayed successfully', savedRequest).toJSON()
    );
  }
);

/**
 * DELETE /api/api-requests/:id
 * Deletes an API request by uuid.
 */
export const deleteApiRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await ApiRequest.findOneAndDelete({ id: req.params.id }).exec();

    if (!result) {
      throw new ApiError(404, `API request not found: ${req.params.id}`);
    }

    res.status(200).json(
      new ApiResponse(200, 'API request deleted').toJSON()
    );
  }
);
