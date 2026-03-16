import { Request, Response } from 'express';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { WebhookEvent, IWebhookEvent } from './webhooks.model';
import { getIO } from '../../shared/socket';
import { parseSource } from '../../shared/parseSource';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { ApiError } from '../../shared/utils/ApiError';
import { ENV } from '../../env';

/**
 * POST /api/webhooks/:source
 * Intercepts an incoming webhook from a payment provider,
 * logs it, and forwards it to the developer's backend.
 */
export const interceptWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const source = parseSource(req.params.source ?? req.originalUrl);
    const startTime = Date.now();

    const forwardUrl = `${ENV.BACKEND_TARGET_URL}${req.originalUrl}`;

    let responseStatus = 502;
    let responseTime = 0;
    let upstreamResponseData: unknown = null;

    try {
      const axiosConfig: AxiosRequestConfig = {
        method: req.method as AxiosRequestConfig['method'],
        url: forwardUrl,
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(
            ([key, val]) => key.toLowerCase() !== 'host' && val !== undefined
          )
        ) as Record<string, string>,
        data: req.body as Record<string, unknown>,
        validateStatus: () => true, // Accept all statuses — don't throw on 4xx/5xx
      };

      const upstreamResponse = await axios(axiosConfig);
      responseStatus = upstreamResponse.status;
      responseTime = Date.now() - startTime;
      upstreamResponseData = upstreamResponse.data;
    } catch (error) {
      responseTime = Date.now() - startTime;
      if (error instanceof AxiosError) {
        responseStatus = error.response?.status ?? 502;
        upstreamResponseData = error.response?.data ?? { error: error.message };
      } else if (error instanceof Error) {
        upstreamResponseData = { error: error.message };
      }
    }

    const webhookEvent: IWebhookEvent = {
      id: uuidv4(),
      source,
      method: req.method,
      url: req.originalUrl,
      headers: (req.headers ?? {}) as Record<string, string>,
      payload: (req.body ?? {}) as Record<string, unknown>,
      status: responseStatus,
      responseTime,
      timestamp: new Date(),
      failed: responseStatus >= 400,
    };

    const savedEvent = await new WebhookEvent(webhookEvent).save();

    const io = getIO();
    io.emit('new_webhook', savedEvent.toObject());

    res.status(responseStatus).json(upstreamResponseData);
  }
);

/**
 * GET /api/webhooks
 * Returns all webhook events, with optional filtering.
 * Query params: ?source=razorpay&failed=true&limit=50
 */
export const getAllWebhooks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { source, failed, limit } = req.query;

    const filter: Record<string, unknown> = {};
    if (source && typeof source === 'string') {
      filter.source = source;
    }
    if (failed !== undefined && typeof failed === 'string') {
      filter.failed = failed === 'true';
    }

    const queryLimit = limit && typeof limit === 'string' ? parseInt(limit, 10) : 100;

    const events = await WebhookEvent.find(filter)
      .sort({ timestamp: -1 })
      .limit(queryLimit)
      .exec();

    res.status(200).json(
      new ApiResponse(200, 'Webhook events retrieved', events).toJSON()
    );
  }
);

/**
 * GET /api/webhooks/:id
 * Returns a single webhook event by uuid.
 */
export const getWebhookById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const event = await WebhookEvent.findOne({ id: req.params.id }).exec();

    if (!event) {
      throw new ApiError(404, `Webhook event not found: ${req.params.id}`);
    }

    res.status(200).json(
      new ApiResponse(200, 'Webhook event retrieved', event).toJSON()
    );
  }
);

/**
 * POST /api/webhooks/:id/replay
 * Re-forwards a stored webhook to the developer's backend.
 */
export const replayWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const original = await WebhookEvent.findOne({ id: req.params.id }).exec();

    if (!original) {
      throw new ApiError(404, `Webhook event not found: ${req.params.id}`);
    }

    const forwardUrl = `${ENV.BACKEND_TARGET_URL}${original.url}`;
    const startTime = Date.now();

    let responseStatus = 502;
    let responseTime = 0;

    try {
      const axiosConfig: AxiosRequestConfig = {
        method: 'POST',
        url: forwardUrl,
        headers: original.headers as Record<string, string>,
        data: original.payload,
        validateStatus: () => true,
      };

      const upstreamResponse = await axios(axiosConfig);
      responseStatus = upstreamResponse.status;
      responseTime = Date.now() - startTime;
    } catch (error) {
      responseTime = Date.now() - startTime;
      if (error instanceof AxiosError) {
        responseStatus = error.response?.status ?? 502;
      }
    }

    const replayedEvent: IWebhookEvent = {
      id: uuidv4(),
      source: original.source,
      method: 'POST',
      url: original.url,
      headers: original.headers,
      payload: original.payload,
      status: responseStatus,
      responseTime,
      timestamp: new Date(),
      failed: responseStatus >= 400,
    };

    const savedEvent = await new WebhookEvent(replayedEvent).save();

    const io = getIO();
    io.emit('new_webhook', savedEvent.toObject());

    res.status(200).json(
      new ApiResponse(200, 'Webhook replayed successfully', savedEvent).toJSON()
    );
  }
);

/**
 * DELETE /api/webhooks/:id
 * Deletes a webhook event by uuid.
 */
export const deleteWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await WebhookEvent.findOneAndDelete({ id: req.params.id }).exec();

    if (!result) {
      throw new ApiError(404, `Webhook event not found: ${req.params.id}`);
    }

    res.status(200).json(
      new ApiResponse(200, 'Webhook event deleted').toJSON()
    );
  }
);
