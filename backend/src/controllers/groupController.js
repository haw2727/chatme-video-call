import Group from '../models/Group.js';
import User from '../models/User.js';
import { streamClient } from '../lib/stream.js';

export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds = [] } = req.body;
        const creatorId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        // Create unique stream channel ID
        const streamChannelId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create group in database
        const group = await Group.create({
            name,
            description,
            members: [creatorId, ...memberIds],
            admins: [creatorId],
            createdBy: creatorId,
            streamChannelId
        });

        // Create Stream channel
        const channel = streamClient.channel('messaging', streamChannelId, {
            name,
            created_by_id: creatorId.toString(),
            members: [creatorId.toString(), ...memberIds.map(id => id.toString())]
        });

        await channel.create(creatorId.toString());

        // Populate group data
        const populatedGroup = await Group.findById(group._id)
            .populate('members', 'fullName profilePic email')
            .populate('admins', 'fullName profilePic email')
            .populate('createdBy', 'fullName profilePic email');

        res.status(201).json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId })
            .populate('members', 'fullName profilePic email isOnline')
            .populate('admins', 'fullName profilePic email')
            .populate('createdBy', 'fullName profilePic email')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, groups });
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if current user is admin
        if (!group.admins.includes(currentUserId)) {
            return res.status(403).json({ message: 'Only admins can add members' });
        }

        // Check if user is already a member
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        // Add member to group
        group.members.push(userId);
        await group.save();

        // Add member to Stream channel
        const channel = streamClient.channel('messaging', group.streamChannelId);
        await channel.addMembers([userId.toString()]);

        const updatedGroup = await Group.findById(groupId)
            .populate('members', 'fullName profilePic email isOnline')
            .populate('admins', 'fullName profilePic email');

        res.status(200).json({ success: true, group: updatedGroup });
    } catch (error) {
        console.error('Error adding member to group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Remove user from members and admins
        group.members = group.members.filter(id => !id.equals(userId));
        group.admins = group.admins.filter(id => !id.equals(userId));

        // If creator leaves, transfer ownership to first admin or delete group
        if (group.createdBy.equals(userId)) {
            if (group.admins.length > 0) {
                group.createdBy = group.admins[0];
            } else if (group.members.length > 0) {
                group.createdBy = group.members[0];
                group.admins.push(group.members[0]);
            } else {
                // Delete group if no members left
                await Group.findByIdAndDelete(groupId);
                return res.status(200).json({ success: true, message: 'Group deleted' });
            }
        }

        await group.save();

        // Remove from Stream channel
        const channel = streamClient.channel('messaging', group.streamChannelId);
        await channel.removeMembers([userId.toString()]);

        res.status(200).json({ success: true, message: 'Left group successfully' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};