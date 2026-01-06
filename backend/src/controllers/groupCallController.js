import Group from '../models/Group.js';
import { getUserConnection, broadcastToUsers } from './callController.js';

// Start a group call and notify all members
export const startGroupCall = async (req, res) => {
    try {
        const { groupId, callType, callId } = req.body; // callType: 'voice' or 'video'
        const starterId = req.user._id;

        // Get the group and verify user is admin
        const group = await Group.findById(groupId).populate('members', 'fullName profilePic').populate('admins', '_id');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is admin or creator
        const isAdmin = group.admins.some(admin => admin._id.toString() === starterId.toString()) ||
            group.createdBy.toString() === starterId.toString();

        if (!isAdmin) {
            return res.status(403).json({ message: 'Only group admins can start calls' });
        }

        // Create call notification data
        const callNotification = {
            type: 'group_call_started',
            groupId: group._id,
            groupName: group.name,
            callId,
            callType,
            startedBy: {
                _id: req.user._id,
                name: req.user.fullName,
                profilePic: req.user.profilePic,
                isAdmin: true
            },
            memberCount: group.members.length,
            timestamp: new Date()
        };

        // Get all member IDs except the starter
        const memberIds = group.members
            .filter(member => member._id.toString() !== starterId.toString())
            .map(member => member._id.toString());

        // Send notification to all group members via WebSocket
        const notificationsSent = broadcastToUsers(memberIds, callNotification);

        console.log(`Group call started by ${req.user.fullName} in ${group.name}`);
        console.log(`Notifications sent to ${notificationsSent} out of ${memberIds.length} members`);

        res.status(200).json({
            success: true,
            message: `Group ${callType} call started`,
            callId,
            notificationsSent,
            totalMembers: memberIds.length
        });

    } catch (error) {
        console.error('Error starting group call:', error);
        res.status(500).json({ message: 'Failed to start group call' });
    }
};

// End a group call and notify all members
export const endGroupCall = async (req, res) => {
    try {
        const { groupId, callId } = req.body;
        const enderId = req.user._id;

        // Get the group
        const group = await Group.findById(groupId).populate('members', 'fullName profilePic');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Create call end notification
        const callEndNotification = {
            type: 'group_call_ended',
            groupId: group._id,
            groupName: group.name,
            callId,
            endedBy: {
                _id: req.user._id,
                name: req.user.fullName,
                profilePic: req.user.profilePic
            },
            timestamp: new Date()
        };

        // Get all member IDs except the ender
        const memberIds = group.members
            .filter(member => member._id.toString() !== enderId.toString())
            .map(member => member._id.toString());

        // Send notification to all group members
        const notificationsSent = broadcastToUsers(memberIds, callEndNotification);

        console.log(`Group call ended by ${req.user.fullName} in ${group.name}`);

        res.status(200).json({
            success: true,
            message: 'Group call ended',
            notificationsSent
        });

    } catch (error) {
        console.error('Error ending group call:', error);
        res.status(500).json({ message: 'Failed to end group call' });
    }
};

// Join a group call
export const joinGroupCall = async (req, res) => {
    try {
        const { groupId, callId } = req.body;
        const joinerId = req.user._id;

        // Get the group
        const group = await Group.findById(groupId).populate('members', 'fullName profilePic');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Verify user is a member
        const isMember = group.members.some(member => member._id.toString() === joinerId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // Create join notification
        const joinNotification = {
            type: 'member_joined_call',
            groupId: group._id,
            groupName: group.name,
            callId,
            joinedBy: {
                _id: req.user._id,
                name: req.user.fullName,
                profilePic: req.user.profilePic
            },
            timestamp: new Date()
        };

        // Get all member IDs except the joiner
        const memberIds = group.members
            .filter(member => member._id.toString() !== joinerId.toString())
            .map(member => member._id.toString());

        // Send notification to all other group members
        broadcastToUsers(memberIds, joinNotification);

        res.status(200).json({
            success: true,
            message: 'Joined group call successfully'
        });

    } catch (error) {
        console.error('Error joining group call:', error);
        res.status(500).json({ message: 'Failed to join group call' });
    }
};