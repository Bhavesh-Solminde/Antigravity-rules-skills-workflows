import { Router } from 'express';
import {
  proxyApiRequest,
  getAllApiRequests,
  getApiRequestById,
  replayApiRequest,
  deleteApiRequest,
} from './api-requests.controller';

const router = Router();

// POST proxy a request to an external API
router.post('/api-requests/proxy', proxyApiRequest);

// GET all API request logs (with optional filters)
router.get('/api-requests', getAllApiRequests);

// GET single API request by uuid
router.get('/api-requests/:id', getApiRequestById);

// POST replay a stored API request
router.post('/api-requests/:id/replay', replayApiRequest);

// DELETE an API request log
router.delete('/api-requests/:id', deleteApiRequest);

export default router;
