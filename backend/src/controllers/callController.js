import User from '../models/User.js';
import { generateStreamToken } from '../lib/stream.js';

// Store active calls and call invitations in memory
// In production, you'd want to use Redis or a database
const activeCallInvitations = new Map(); // callId -> { caller, participants, type, createdAt }
const activeCalls = new Map(); // callId -> { participants, type, startedAt }

// WebSocket connections by user ID
const userConnections = new Map(); // userId -> WebSocket

export function setUserConnection(userId, ws) {
    userConnections.set(userId, ws);
    console.log(`User ${userId} connected to WebSocket`);
}

export function removeUserConnection(userId) {
    userConnections.delete(userId);
    console.log(`User ${userId} disconnected from WebSocket`);
}

export function broadcastToUser(userId, message) {
    console.log(`[broadcastToUser] Attempting to send to user: ${userId}`);
    console.log(`[broadcastToUser] Total connections: ${userConnections.size}`);
    console.log(`[broadcastToUser] Connected users:`, Array.from(userConnections.keys()));

    const ws = userConnections.get(userId);

    if (!ws) {
        console.log(`[broadcastToUser] No WebSocket connection found for user: ${userId}`);
        return false;
    }

    console.log(`[broadcastToUser] WebSocket found, readyState: ${ws.readyState}`);

    if (ws.readyState === 1) { // WebSocket.OPEN
        try {
            ws.send(JSON.stringify(message));
            console.log(`[broadcastToUser] ✅ Message sent successfully to user: ${userId}`);
            return true;
        } catch (error) {
            console.error(`[broadcastToUser] ❌ Failed to send message to user ${userId}:`, error);
            userConnections.delete(userId);
            return false;
        }
    } else {
        console.log(`[broadcastToUser] ❌ WebSocket not open for user ${userId}, readyState: ${ws.readyState}`);
        return false;
    }
}

// Broadcast message to multiple users
export function broadcastToUsers(userIds, message) {
    let sentCount = 0;
    for (const userId of userIds) {
        const sent = broadcastToUser(userId, message);
        if (sent) sentCount++;
    }
    console.log(`Broadcast sent to ${sentCount}/${userIds.length} users`);
    return sentCount;
}

// Get user connection status
export function getUserConnection(userId) {
    return userConnections.get(userId);
}

// Initiate a call invitation
export async function initiateCall(req, res) {
    try {
        const caller = req.user;
        const { participants, type = 'video' } = req.body; // participants is array of user IDs

        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ message: 'Participants array is required' });
        }

        // Validate participants exist
        const participantUsers = await User.find({
            _id: { $in: participants }
        }).select('_id fullName profilePic');

        if (participantUsers.length !== participants.length) {
            return res.status(400).json({ message: 'Some participants not found' });
        }

        // Generate unique call ID
        const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Store call invitation
        const callInvitation = {
            callId,
            caller: {
                id: caller._id.toString(),
                name: caller.fullName,
                profilePic: caller.profilePic
            },
            participants: participantUsers.map(user => ({
                id: user._id.toString(),
                name: user.fullName,
                profilePic: user.profilePic,
                status: 'pending' // pending, accepted, rejected
            })),
            type,
            createdAt: new Date()
        };

        activeCallInvitations.set(callId, callInvitation);

        // Send call invitation to all participants
        const invitationMessage = {
            type: 'call_invitation',
            callId,
            caller: callInvitation.caller,
            callType: type,
            participants: callInvitation.participants.length + 1, // +1 for caller
            createdAt: callInvitation.createdAt
        };

        console.log('Sending call invitation:', invitationMessage);
        console.log('To participants:', participantUsers.map(u => u._id.toString()));

        let sentCount = 0;
        for (const participant of participantUsers) {
            const participantId = participant._id.toString();
            console.log(`Attempting to send to participant: ${participantId}`);
            const sent = broadcastToUser(participantId, invitationMessage);
            console.log(`Sent to ${participantId}: ${sent}`);
            if (sent) sentCount++;
        }

        console.log(`Call invitation sent to ${sentCount}/${participantUsers.length} participants`);

        // Auto-expire invitation after 60 seconds
        setTimeout(() => {
            if (activeCallInvitations.has(callId)) {
                activeCallInvitations.delete(callId);
                console.log(`Call invitation ${callId} expired`);
            }
        }, 60000);

        res.status(200).json({
            success: true,
            callId,
            message: `Call invitation sent to ${sentCount}/${participantUsers.length} participants`,
            callInvitation
        });

    } catch (error) {
        console.error('Error initiating call:', error);
        res.status(500).json({ message: 'Failed to initiate call' });
    }
}

// Respond to call invitation (accept/reject)
export async function respondToCall(req, res) {
    try {
        const user = req.user;
        const { callId, response } = req.body; // response: 'accept' or 'reject'

        if (!['accept', 'reject'].includes(response)) {
            return res.status(400).json({ message: 'Response must be "accept" or "reject"' });
        }

        const callInvitation = activeCallInvitations.get(callId);
        if (!callInvitation) {
            return res.status(404).json({ message: 'Call invitation not found or expired' });
        }

        // Find user in participants
        const participantIndex = callInvitation.participants.findIndex(
            p => p.id === user._id.toString()
        );

        if (participantIndex === -1) {
            return res.status(403).json({ message: 'You are not invited to this call' });
        }

        // Update participant status
        callInvitation.participants[participantIndex].status = response === 'accept' ? 'accepted' : 'rejected';

        // Notify caller about the response
        const responseMessage = {
            type: 'call_response',
            callId,
            participant: {
                id: user._id.toString(),
                name: user.fullName,
                profilePic: user.profilePic
            },
            response,
            timestamp: new Date()
        };

        broadcastToUser(callInvitation.caller.id, responseMessage);

        // If accepted, provide Stream token and call details
        if (response === 'accept') {
            const token = generateStreamToken(user._id.toString());

            res.status(200).json({
                success: true,
                message: 'Call accepted',
                callId,
                token,
                callType: callInvitation.type,
                caller: callInvitation.caller,
                participants: callInvitation.participants
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Call rejected'
            });
        }

        // Check if all participants have responded
        const allResponded = callInvitation.participants.every(p => p.status !== 'pending');
        if (allResponded) {
            const acceptedCount = callInvitation.participants.filter(p => p.status === 'accepted').length;

            if (acceptedCount > 0) {
                // Move to active calls
                activeCalls.set(callId, {
                    ...callInvitation,
                    startedAt: new Date(),
                    acceptedParticipants: callInvitation.participants.filter(p => p.status === 'accepted')
                });
            }

            // Clean up invitation
            activeCallInvitations.delete(callId);
        }

    } catch (error) {
        console.error('Error responding to call:', error);
        res.status(500).json({ message: 'Failed to respond to call' });
    }
}

// Get active call details
export async function getCallDetails(req, res) {
    try {
        const { callId } = req.params;
        const user = req.user;

        // Check active calls first
        let callData = activeCalls.get(callId);
        if (!callData) {
            // Check pending invitations
            callData = activeCallInvitations.get(callId);
        }

        if (!callData) {
            return res.status(404).json({ message: 'Call not found' });
        }

        // Verify user is part of this call
        const isParticipant = callData.participants.some(p => p.id === user._id.toString());
        const isCaller = callData.caller && callData.caller.id === user._id.toString();

        if (!isParticipant && !isCaller) {
            return res.status(403).json({ message: 'You are not part of this call' });
        }

        res.status(200).json({
            success: true,
            callData
        });

    } catch (error) {
        console.error('Error getting call details:', error);
        res.status(500).json({ message: 'Failed to get call details' });
    }
}

// End call
export async function endCall(req, res) {
    try {
        const { callId } = req.params;
        const user = req.user;

        const callData = activeCalls.get(callId) || activeCallInvitations.get(callId);
        if (!callData) {
            return res.status(404).json({ message: 'Call not found' });
        }

        // Verify user can end this call (caller or participant)
        const isParticipant = callData.participants.some(p => p.id === user._id.toString());
        const isCaller = callData.caller && callData.caller.id === user._id.toString();

        if (!isParticipant && !isCaller) {
            return res.status(403).json({ message: 'You cannot end this call' });
        }

        // Notify all participants that call ended
        const endMessage = {
            type: 'call_ended',
            callId,
            endedBy: {
                id: user._id.toString(),
                name: user.fullName
            },
            timestamp: new Date()
        };

        // Notify caller if user is participant
        if (callData.caller && callData.caller.id !== user._id.toString()) {
            broadcastToUser(callData.caller.id, endMessage);
        }

        // Notify all participants
        callData.participants.forEach(participant => {
            if (participant.id !== user._id.toString()) {
                broadcastToUser(participant.id, endMessage);
            }
        });

        // Clean up
        activeCalls.delete(callId);
        activeCallInvitations.delete(callId);

        res.status(200).json({
            success: true,
            message: 'Call ended'
        });

    } catch (error) {
        console.error('Error ending call:', error);
        res.status(500).json({ message: 'Failed to end call' });
    }
}

// Get user's active calls
export async function getUserActiveCalls(req, res) {
    try {
        const user = req.user;
        const userId = user._id.toString();

        const userCalls = [];

        // Check active calls
        for (const [callId, callData] of activeCalls.entries()) {
            const isParticipant = callData.participants.some(p => p.id === userId);
            const isCaller = callData.caller && callData.caller.id === userId;

            if (isParticipant || isCaller) {
                userCalls.push({
                    callId,
                    ...callData,
                    status: 'active'
                });
            }
        }

        // Check pending invitations
        for (const [callId, callData] of activeCallInvitations.entries()) {
            const isParticipant = callData.participants.some(p => p.id === userId);
            const isCaller = callData.caller && callData.caller.id === userId;

            if (isParticipant || isCaller) {
                userCalls.push({
                    callId,
                    ...callData,
                    status: 'pending'
                });
            }
        }

        res.status(200).json({
            success: true,
            calls: userCalls
        });

    } catch (error) {
        console.error('Error getting user active calls:', error);
        res.status(500).json({ message: 'Failed to get active calls' });
    }
}