import { Request, Response } from 'express';
import { WebhookEvent } from '../webhooks/webhooks.model';
import { ApiRequest } from '../api-requests/api-requests.model';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { ApiError } from '../../shared/utils/ApiError';

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

    let prompt = '';

    if (type === 'webhook') {
      const event = await WebhookEvent.findOne({ id: eventId }).exec();
      if (!event) {
        throw new ApiError(404, `Webhook event not found: ${eventId}`);
      }

      const sanitizedHeaders = sanitizeHeaders(event.headers);

      prompt = `A webhook request failed.

Source: ${event.source}
Method: ${event.method}
URL: ${event.url}
Note: This webhook was forwarded to the developer's backend at BACKEND_TARGET_URL and that server returned a failure.

Payload:
${safeStringify(event.payload)}

Headers:
${safeStringify(sanitizedHeaders)}

Response Status: ${event.status}
Response Time: ${event.responseTime}ms

You are a Node.js backend expert. Identify the root cause of this failure and suggest a precise fix with corrected code. Be specific about which field or header is wrong and why.`;
    } else {
      const apiReq = await ApiRequest.findOne({ id: eventId }).exec();
      if (!apiReq) {
        throw new ApiError(404, `API request not found: ${eventId}`);
      }

      const sanitizedHeaders = sanitizeHeaders(apiReq.requestHeaders);

      prompt = `An API request failed.

Endpoint: ${apiReq.endpoint}
Method: ${apiReq.method}
Service: ${apiReq.service}
Note: This API request was forwarded to the payment provider and they returned a failure response.

Payload:
${safeStringify(apiReq.requestPayload)}

Headers:
${safeStringify(sanitizedHeaders)}

Response Status: ${apiReq.responseStatus}
Response Body:
${safeStringify(apiReq.responseBody)}
Response Time: ${apiReq.responseTime}ms

You are a Node.js backend expert. Identify the root cause of this failure and suggest a precise fix with corrected code. Be specific about which field or header is wrong and why.`;
    }

    res.status(200).json(
      new ApiResponse(200, 'Debug prompt generated', { prompt }).toJSON()
    );
  }
);
