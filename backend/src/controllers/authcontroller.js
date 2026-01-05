import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { upsertStreamUser } from '../lib/stream.js';
dotenv.config();

// Debugging logs
console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!process.env.JWT_SECRET_KEY) {
    console.warn("Warning: JWT_SECRET_KEY is not defined. Using a fallback value is not secure.");
}

export const signup = async (req, res) => {
    const { fullName, email, password, bio, location } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Full name, email and password are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists, please use a different email!" });
        }

        const idx = Math.floor(Math.random() * 1000) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        // Save the new user (password will be hashed by User model pre-save hook)
        const newUser = await User.create({
            fullName,
            email,
            password,
            bio: bio || "",
            location: location || "",
            profilePic: randomAvatar,
            isOnline: true
        });

        // after user is created, upsert into Stream
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
        } catch (err) {
            console.warn("Stream upsert failed for signup user:", err);
        }

        const jwtSecretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';
        const token = jwt.sign({ userId: newUser._id }, jwtSecretKey, { expiresIn: '7d' });

        // Set cookie for convenience. Use a more permissive SameSite in development so
        // cross-origin requests from the frontend (localhost:5173) can receive the cookie.
        // In production you may want to use 'none' + secure: true.
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production' // secure only in production
        });

        // Return token in the response as well so frontends that cannot rely on cookies can use it
        res.status(201).json({
            success: true, token, user: {
                ...newUser.toObject(),
                password: undefined
            }
        });
    } catch (err) {
        console.error("Error in signup:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        // upsert into Stream on login
        try {
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.fullName,
                image: user.profilePic || "",
            });
        } catch (err) {
            console.warn("Stream upsert failed for login user:", err);
        }

        // Update user online status
        await User.findByIdAndUpdate(user._id, {
            isOnline: true,
            lastSeen: new Date()
        });

        const jwtSecretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';
        const token = jwt.sign({ userId: user._id }, jwtSecretKey, { expiresIn: '7d' });

        // Set cookie for convenience. See note above about SameSite/secure.
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        // Return token as well so client can store it and use Authorization header if cookies are blocked
        res.status(200).json({ success: true, token, user });

    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        // Update user offline status
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                isOnline: false,
                lastSeen: new Date()
            });
        }

        res.clearCookie('jwt');
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};