
import express from 'express';
import { signup, login, logout } from '../controllers/authcontroller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();
// Signup route
router.post('/signup', signup);
// login route
router.post('/login', login);
// logout route
router.post('/logout', logout);
//check user is logged in or not
router.get('/me', protectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user })
})

export default router;