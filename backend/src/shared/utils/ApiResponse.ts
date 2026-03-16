export interface ApiResponsePayload<T> {
  statusCode: number;
  message: string;
  data: T | null;
  success: boolean;
}

export class ApiResponse<T> {
  public statusCode: number;
  public message: string;
  public data: T | null;
  public success: boolean;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }

  toJSON(): ApiResponsePayload<T> {
    return {
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      success: this.success,
    };
  }
}
