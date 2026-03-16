import { Router } from 'express';
import { generateDebugPrompt } from './ai-debug.controller';

const router = Router();

// POST generate a debug prompt for a failed event
router.post('/ai-debug/prompt', generateDebugPrompt);

export default router;
