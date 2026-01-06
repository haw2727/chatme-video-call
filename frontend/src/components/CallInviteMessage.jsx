import React, { useState } from 'react';
import { Phone, Video, Check, X, Users, Clock } from 'lucide-react';

const CallInviteMessage = ({ message, onJoinCall, onRejectCall, currentUserId }) => {
    const [hasResponded, setHasResponded] = useState(false);
    const [response, setResponse] = useState(null);

    console.log('CallInviteMessage received:', {
        message,
        currentUserId,
        hasAttachments: !!message?.attachments,
        attachmentCount: message?.attachments?.length || 0
    });

    // Safety checks
    if (!message || !message.attachments || !Array.isArray(message.attachments)) {
        console.warn('CallInviteMessage: Invalid message structure', message);
        return null;
    }

    // Parse call data from message attachments
    const attachment = message.attachments[0];
    console.log('First attachment:', attachment);

    if (!attachment || attachment.type !== 'group_call_invite') {
        console.warn('CallInviteMessage: Not a group call invite', attachment);
        return null;
    }

    const callId = attachment.call_id;
    const callType = attachment.call_type;
    const starterName = attachment.started_by;
    const isFromCurrentUser = message.user?.id === currentUserId;

    console.log('Call data:', { callId, callType, starterName, isFromCurrentUser });

    // Validate required data
    if (!callId || !callType || !starterName) {
        console.warn('CallInviteMessage: Missing required call data', { callId, callType, starterName });
        return null;
    }

    const handleJoin = async () => {
        if (hasResponded || isFromCurrentUser) return;

        setHasResponded(true);
        setResponse('joined');

        try {
            if (onJoinCall) {
                await onJoinCall(callId, callType);
            }
        } catch (error) {
            console.error('Error joining call:', error);
            setHasResponded(false);
            setResponse(null);
        }
    };

    const handleReject = async () => {
        if (hasResponded || isFromCurrentUser) return;

        setHasResponded(true);
        setResponse('rejected');

        try {
            if (onRejectCall) {
                await onRejectCall(callId, callType);
            }
        } catch (error) {
            console.error('Error rejecting call:', error);
            setHasResponded(false);
            setResponse(null);
        }
    };

    return (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-4 my-2 max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${callType === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {callType === 'video' ? (
                        <Video className="w-5 h-5" />
                    ) : (
                        <Phone className="w-5 h-5" />
                    )}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm">
                        Group {callType === 'video' ? 'Video' : 'Voice'} Call
                    </h4>
                    <p className="text-xs text-base-content/60 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Started by {starterName}
                    </p>
                </div>
            </div>

            {/* Call Info */}
            <div className="text-center mb-4">
                <p className="text-sm font-medium mb-1">
                    {callType === 'video' ? '📹' : '🎤'} {starterName} started a group {callType} call
                </p>
                <p className="text-xs text-base-content/50">
                    Join now or decline the invitation
                </p>
            </div>

            {/* Action Buttons */}
            {isFromCurrentUser ? (
                <div className="bg-info/20 text-info text-center p-2 rounded-lg">
                    <span className="text-sm font-medium">
                        🎯 You started this call
                    </span>
                </div>
            ) : !hasResponded ? (
                <div className="flex gap-2">
                    <button
                        onClick={handleJoin}
                        className="btn btn-success btn-sm flex-1 gap-2 animate-pulse"
                    >
                        <Check className="w-4 h-4" />
                        Join
                    </button>
                    <button
                        onClick={handleReject}
                        className="btn btn-outline btn-error btn-sm flex-1 gap-2"
                    >
                        <X className="w-4 h-4" />
                        Decline
                    </button>
                </div>
            ) : (
                <div className={`text-center p-2 rounded-lg ${response === 'joined'
                    ? 'bg-success/20 text-success'
                    : 'bg-error/20 text-error'
                    }`}>
                    <span className="text-sm font-medium">
                        {response === 'joined' ? '✅ You joined the call' : '❌ You declined the call'}
                    </span>
                </div>
            )}

            {/* Call ID (for debugging) */}
            <div className="text-xs text-base-content/30 text-center mt-2 font-mono">
                ID: {callId.slice(-8)}
            </div>
        </div>
    );
};

export default CallInviteMessage;