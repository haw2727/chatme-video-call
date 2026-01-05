// Create a test user for development
// Run with: node scripts/createTestUser.js (from backend root)
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "../src/lib/db.js";
import User from "../src/models/User.js";

async function createTestUser() {
    try {
        await connectDB();

        // Check if test user already exists
        const existingUser = await User.findOne({ email: "test@example.com" });
        if (existingUser) {
            console.log("Test user already exists:");
            console.log("Email: test@example.com");
            console.log("Password: password123");
            process.exit(0);
        }

        // Create test user
        const testUser = await User.create({
            fullName: "Test User",
            email: "test@example.com",
            password: "password123", // Will be hashed by the model
            bio: "This is a test user for development",
            location: "Test City",
            profilePic: "https://avatar.iran.liara.run/public/1.png",
            isOnline: false
        });

        console.log("✅ Test user created successfully!");
        console.log("Email: test@example.com");
        console.log("Password: password123");
        console.log("Full Name: Test User");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating test user:", error);
        process.exit(1);
    }
}

createTestUser();