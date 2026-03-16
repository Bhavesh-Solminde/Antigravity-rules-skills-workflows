import { Request, Response, NextFunction } from 'express';
import { ApiError } from './utils/ApiError';
import { ENV } from '../env';

interface ErrorResponseBody {
  success: false;
  message: string;
  stack?: string;
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  const statusCode = 500;
  const body: ErrorResponseBody = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (ENV.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};
