import express from 'express';
import { createGroup, getUserGroups, addMemberToGroup, leaveGroup } from '../controllers/groupController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', protectRoute, createGroup);
router.get('/my-groups', protectRoute, getUserGroups);
router.post('/:groupId/add-member', protectRoute, addMemberToGroup);
router.delete('/:groupId/leave', protectRoute, leaveGroup);

export default router;