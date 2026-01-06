import express from 'express';
import { startGroupCall, endGroupCall, joinGroupCall } from '../controllers/groupCallController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Start a group call (admin only)
router.post('/start', protectRoute, startGroupCall);

// End a group call
router.post('/end', protectRoute, endGroupCall);

// Join a group call
router.post('/join', protectRoute, joinGroupCall);

export default router;