
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        // First try cookie-based token
        let token = req.cookies?.jwt;
        // If not found in cookie, check Authorization header (Bearer token)
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - no token provided' });
        }
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized - invalid token' });
        }
        // Attach the user to the request object
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - user not found' });
        }
        req.user = user; // Make sure this is set
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
