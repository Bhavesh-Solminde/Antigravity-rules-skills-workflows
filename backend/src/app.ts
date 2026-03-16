import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './env';
import { errorMiddleware } from './shared/errorMiddleware';
import webhookRoutes from './modules/webhooks/webhooks.routes';
import apiRequestRoutes from './modules/api-requests/api-requests.routes';
import aiDebugRoutes from './modules/ai-debug/ai-debug.routes';
import codeReviewRoutes from './modules/code-review/code-review.routes';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: ENV.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Server is healthy',
    data: { uptime: process.uptime() },
  });
});

// Feature module routes
app.use('/api', webhookRoutes);
app.use('/api', apiRequestRoutes);
app.use('/api', aiDebugRoutes);
app.use('/api', codeReviewRoutes);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
