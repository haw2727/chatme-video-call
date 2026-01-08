import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const makeAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            console.error('MongoDB URI not found in .env file');
            console.log('Please set MONGO_URI or MONGODB_URI in your .env file');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Get email from command line argument
        const email = process.argv[2];

        if (!email) {
            console.error('Please provide an email address');
            console.log('Usage: node scripts/makeAdmin.js <email>');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        if (user.isAdmin) {
            console.log(`User ${email} is already an admin`);
            process.exit(0);
        }

        user.isAdmin = true;
        await user.save();

        console.log(`✓ User ${email} is now an admin!`);
        process.exit(0);
    } catch (error) {
        console.error('Error making user admin:', error);
        process.exit(1);
    }
};

makeAdmin();
