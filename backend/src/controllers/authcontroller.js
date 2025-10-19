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
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
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
            return res.status(400).json({ message: "User already exists, please use a different one!" });
        }

        const idx = Math.floor(Math.random() * 1000) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        // Save the new user (password will be hashed by User model pre-save hook)
        const newUser = await User.create({
            fullName,
            email,
            password,
            profilePic: randomAvatar
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
        res.status(201).json({ success: true, token, user: {
            ...newUser.toObject(),
             password: undefined
            } });
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

export const logout = (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export async function onboard(req, res) {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        // Validate required fields
        const missingFields = Object.entries({
            fullName: !fullName && "fullName",
            bio: !bio && "bio",
            nativeLanguage: !nativeLanguage && "nativeLanguage",
            learningLanguage: !learningLanguage && "learningLanguage",
            location: !location && "location",
        })
            .filter(([_, value]) => value) // Keep only missing fields
            .map(([key]) => key); // Extract field names

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields,
            });
        }

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullName,
                bio,
                nativeLanguage,
                learningLanguage,
                location,
                isOnboarded: true,
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
            console.log(`Stream user updated after onboarding for: ${updatedUser.fullName}`);
        } catch (error) {
            console.error("Error upserting Stream user:", error);
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
        console.error("Error in onboarding:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};