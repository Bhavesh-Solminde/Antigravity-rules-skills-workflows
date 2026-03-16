export class ApiError extends Error {
  public statusCode: number;
  public errors: string[];
  public success: boolean;

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON(): object {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      success: this.success,
    };
  }
}
