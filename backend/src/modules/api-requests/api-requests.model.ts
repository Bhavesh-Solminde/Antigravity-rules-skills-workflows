import mongoose, { Schema, Document } from 'mongoose';

export interface IApiRequest {
  id: string;
  method: string;
  endpoint: string;
  requestHeaders: Record<string, string>;
  requestPayload: Record<string, unknown> | string;
  responseStatus: number;
  responseBody: Record<string, unknown> | string;
  responseTime: number;
  timestamp: Date;
  failed: boolean;
  service: string;
}

export interface IApiRequestDocument extends Omit<Document, 'id'>, IApiRequest {}

const apiRequestSchema = new Schema<IApiRequestDocument>(
  {
    id: { type: String, required: true, unique: true },
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed, required: true, default: {} },
    requestPayload: { type: Schema.Types.Mixed, required: true, default: {} },
    responseStatus: { type: Number, required: true },
    responseBody: { type: Schema.Types.Mixed, required: true, default: {} },
    responseTime: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    failed: { type: Boolean, required: true, default: false },
    service: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

apiRequestSchema.index({ timestamp: -1 });

export const ApiRequest = mongoose.model<IApiRequestDocument>(
  'ApiRequest',
  apiRequestSchema
);
