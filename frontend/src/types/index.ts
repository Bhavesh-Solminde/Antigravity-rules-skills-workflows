export interface WebhookEvent {
  _id: string;
  id: string;
  source: string;
  eventType?: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  payload: Record<string, unknown> | string;
  status: number;
  responseTime: number;
  timestamp: string;
  failed: boolean;
}

export interface ApiRequest {
  _id: string;
  id: string;
  method: string;
  endpoint: string;
  requestHeaders: Record<string, string>;
  requestPayload: Record<string, unknown> | string;
  responseStatus: number;
  responseBody: Record<string, unknown> | string;
  responseTime: number;
  timestamp: string;
  failed: boolean;
  service: string;
  source?: 'auto' | 'manual';
}

export type EventType = "webhook" | "api_request";
export interface DebugPromptResponse { prompt: string; }
export interface FilterState { source?: string; failed?: boolean; limit: number; }
