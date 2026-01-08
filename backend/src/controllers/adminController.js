import User from '../models/User.js';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        const stats = {
            totalUsers: users.length,
            onlineUsers: users.filter(u => u.isOnline).length,
            adminUsers: users.filter(u => u.isAdmin).length
        };

        res.status(200).json({ users, stats });
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const onlineUsers = await User.countDocuments({ isOnline: true });
        const adminUsers = await User.countDocuments({ isAdmin: true });

        const recentUsers = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            stats: {
                totalUsers,
                onlineUsers,
                adminUsers
            },
            recentUsers
        });
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
