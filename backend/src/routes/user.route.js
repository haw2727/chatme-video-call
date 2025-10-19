import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getRecommendedFriends,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getOutgoingFriendRequests,
  getFriendRequests, // added import
  // ...other controllers...
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/friends', protectRoute, getMyFriends);
router.get('/recommended', protectRoute, getRecommendedFriends);
router.post('/friends-request/:id', protectRoute, sendFriendRequest);
router.put('/friends-request/:id/accept', protectRoute, acceptFriendRequest);

// existing outgoing requests route
router.get('/outgoing-friends-requests', protectRoute, getOutgoingFriendRequests);

// NEW: incoming/accepted friend-requests list (matches frontend)
router.get('/friends-requests', protectRoute, getFriendRequests);

export default router;