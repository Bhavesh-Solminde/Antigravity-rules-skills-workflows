import { Router } from 'express';
import {
  interceptWebhook,
  getAllWebhooks,
  getWebhookById,
  replayWebhook,
  deleteWebhook,
} from './webhooks.controller';

const router = Router();

// GET all webhook events (with optional filters)
router.get('/webhooks', getAllWebhooks);

// GET single webhook event by uuid
router.get('/webhooks/:id', getWebhookById);

// POST intercept incoming webhook from payment provider
router.post('/webhooks/:source', interceptWebhook);

// POST replay a stored webhook to developer's backend
router.post('/webhooks/:id/replay', replayWebhook);

// DELETE a webhook event
router.delete('/webhooks/:id', deleteWebhook);

export default router;
