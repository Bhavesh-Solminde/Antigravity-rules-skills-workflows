import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent {
  id: string;
  source: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  payload: Record<string, unknown> | string;
  status: number;
  responseTime: number;
  timestamp: Date;
  failed: boolean;
}

export interface IWebhookEventDocument extends Omit<Document, 'id'>, IWebhookEvent {}

const webhookEventSchema = new Schema<IWebhookEventDocument>(
  {
    id: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    method: { type: String, required: true },
    url: { type: String, required: true },
    headers: { type: Schema.Types.Mixed, required: true, default: {} },
    payload: { type: Schema.Types.Mixed, required: true, default: {} },
    status: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    failed: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

webhookEventSchema.index({ timestamp: -1 });

export const WebhookEvent = mongoose.model<IWebhookEventDocument>(
  'WebhookEvent',
  webhookEventSchema
);
