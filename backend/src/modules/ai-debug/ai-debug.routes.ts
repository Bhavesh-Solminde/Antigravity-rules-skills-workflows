import { Router } from 'express';
import { generateDebugPrompt, streamDebug } from './ai-debug.controller';

const router = Router();

// POST generate a debug prompt for a failed event
router.post('/ai-debug/prompt', generateDebugPrompt);

// POST stream AI debug analysis via SSE
router.post('/ai-debug/stream', streamDebug);

export default router;
