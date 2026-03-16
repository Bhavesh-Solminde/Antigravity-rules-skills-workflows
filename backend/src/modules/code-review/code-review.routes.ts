import { Router } from 'express';
import { streamCodeReview } from './code-review.controller';

const router = Router();

// POST stream a CodeRabbit-style code review via SSE
router.post('/code-review/stream', streamCodeReview);

export default router;
