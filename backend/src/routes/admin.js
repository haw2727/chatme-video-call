import express from 'express';
import { getAllUsers, deleteUser, getDashboardStats } from '../controllers/adminController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protectRoute);
router.use(adminOnly);

// Get dashboard stats
router.get('/stats', getDashboardStats);

// Get all users
router.get('/users', getAllUsers);

// Delete user
router.delete('/users/:userId', deleteUser);

export default router;
