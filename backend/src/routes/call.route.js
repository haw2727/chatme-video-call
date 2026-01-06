import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    initiateCall,
    respondToCall,
    getCallDetails,
    endCall,
    getUserActiveCalls
} from '../controllers/callController.js';

const router = express.Router();

// Initiate a call invitation
router.post('/initiate', protectRoute, initiateCall);

// Respond to call invitation (accept/reject)
router.post('/respond', protectRoute, respondToCall);

// Get call details
router.get('/:callId', protectRoute, getCallDetails);

// End a call
router.post('/:callId/end', protectRoute, endCall);

// Get user's active calls
router.get('/user/active', protectRoute, getUserActiveCalls);

export default router;