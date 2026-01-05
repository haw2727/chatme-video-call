// Create multiple test users for development
// Run with: node scripts/createMultipleTestUsers.js (from backend root)
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "../src/lib/db.js";
import User from "../src/models/User.js";

const testUsers = [
    {
        fullName: "Alice Johnson",
        email: "alice@example.com",
        password: "password123",
        bio: "Software developer passionate about AI and machine learning. Love hiking and photography in my free time.",
        location: "San Francisco, CA",
        profilePic: "https://avatar.iran.liara.run/public/2.png"
    },
    {
        fullName: "Bob Smith",
        email: "bob@example.com",
        password: "password123",
        bio: "Digital marketing specialist and travel enthusiast. Always looking for the next adventure!",
        location: "New York, NY",
        profilePic: "https://avatar.iran.liara.run/public/3.png"
    },
    {
        fullName: "Carol Davis",
        email: "carol@example.com",
        password: "password123",
        bio: "Graphic designer and coffee lover. Creating beautiful designs one pixel at a time.",
        location: "Austin, TX",
        profilePic: "https://avatar.iran.liara.run/public/4.png"
    },
    {
        fullName: "David Wilson",
        email: "david@example.com",
        password: "password123",
        bio: "Fitness trainer and nutrition coach. Helping people achieve their health goals.",
        location: "Miami, FL",
        profilePic: "https://avatar.iran.liara.run/public/5.png"
    },
    {
        fullName: "Emma Brown",
        email: "emma@example.com",
        password: "password123",
        bio: "Teacher and book enthusiast. Spreading knowledge and inspiring young minds.",
        location: "Seattle, WA",
        profilePic: "https://avatar.iran.liara.run/public/6.png"
    },
    {
        fullName: "Frank Miller",
        email: "frank@example.com",
        password: "password123",
        bio: "Chef and food blogger. Exploring flavors from around the world.",
        location: "Chicago, IL",
        profilePic: "https://avatar.iran.liara.run/public/7.png"
    },
    {
        fullName: "Grace Lee",
        email: "grace@example.com",
        password: "password123",
        bio: "Data scientist and tech enthusiast. Turning data into insights.",
        location: "Boston, MA",
        profilePic: "https://avatar.iran.liara.run/public/8.png"
    },
    {
        fullName: "Henry Taylor",
        email: "henry@example.com",
        password: "password123",
        bio: "Musician and sound engineer. Creating melodies that touch the soul.",
        location: "Nashville, TN",
        profilePic: "https://avatar.iran.liara.run/public/9.png"
    },
    {
        fullName: "Ivy Chen",
        email: "ivy@example.com",
        password: "password123",
        bio: "UX designer focused on creating intuitive and accessible user experiences.",
        location: "Portland, OR",
        profilePic: "https://avatar.iran.liara.run/public/10.png"
    },
    {
        fullName: "Jack Anderson",
        email: "jack@example.com",
        password: "password123",
        bio: "Entrepreneur and startup mentor. Building the future one idea at a time.",
        location: "Denver, CO",
        profilePic: "https://avatar.iran.liara.run/public/11.png"
    },
    {
        fullName: "Kate Rodriguez",
        email: "kate@example.com",
        password: "password123",
        bio: "Environmental scientist working to protect our planet for future generations.",
        location: "San Diego, CA",
        profilePic: "https://avatar.iran.liara.run/public/12.png"
    },
    {
        fullName: "Liam O'Connor",
        email: "liam@example.com",
        password: "password123",
        bio: "Photographer capturing life's beautiful moments. Available for events and portraits.",
        location: "Phoenix, AZ",
        profilePic: "https://avatar.iran.liara.run/public/13.png"
    },
    {
        fullName: "Maya Patel",
        email: "maya@example.com",
        password: "password123",
        bio: "Medical student and volunteer. Dedicated to improving healthcare accessibility.",
        location: "Philadelphia, PA",
        profilePic: "https://avatar.iran.liara.run/public/14.png"
    },
    {
        fullName: "Noah Kim",
        email: "noah@example.com",
        password: "password123",
        bio: "Game developer and indie game enthusiast. Creating immersive gaming experiences.",
        location: "Los Angeles, CA",
        profilePic: "https://avatar.iran.liara.run/public/15.png"
    },
    {
        fullName: "Olivia Martinez",
        email: "olivia@example.com",
        password: "password123",
        bio: "Social media manager and content creator. Helping brands tell their stories.",
        location: "Atlanta, GA",
        profilePic: "https://avatar.iran.liara.run/public/16.png"
    }
];

async function createMultipleTestUsers() {
    try {
        await connectDB();
        console.log("Connected to database");

        let createdCount = 0;
        let existingCount = 0;

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists, skipping...`);
                existingCount++;
                continue;
            }

            // Create new user
            await User.create({
                ...userData,
                isOnline: Math.random() > 0.5 // Randomly set some users as online
            });

            console.log(`✅ Created user: ${userData.fullName} (${userData.email})`);
            createdCount++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Created: ${createdCount} new users`);
        console.log(`⏭️  Skipped: ${existingCount} existing users`);
        console.log(`📝 Total test users: ${testUsers.length}`);
        console.log(`\n🔑 All users have password: password123`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating test users:", error);
        process.exit(1);
    }
}

createMultipleTestUsers();