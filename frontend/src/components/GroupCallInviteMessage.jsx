import React, { useState } from 'react';
import { Phone, Video, Users, Check, X, Clock } from 'lucide-react';
import { showToast } from './Toast';

const GroupCallInviteMessage = ({ message, onJoinCall, onRejectCall }) => {
    const [hasResponded, setHasResponded] = useState(false);
    const [response, setResponse] = useState(null);

    // Parse the call data from message
    const callData = message.attachments?.[0] || {};
    const callId = callData.actions?.[0]?.value || '';
    const callType = callData.title?.includes('Video') ? 'video' : 'voice';
    const starterName = message.user?.name || 'Someone';

    const handleJoin = async () => {
        if (hasResponded) return;

        try {
            setHasResponded(true);
            setResponse('joined');

            if (onJoinCall) {
                await onJoinCall(callId, callType);
            }

            showToast.success(`Joining ${callType} call...`);
        } catch (error) {
            console.error('Error joining call:', error);
            showToast.error('Failed to join call');
            setHasResponded(false);
            setResponse(null);
        }
    };

    const handleReject = async () => {
        if (hasResponded) return;

        try {
            setHasResponded(true);
            setResponse('rejected');

            if (onRejectCall) {
                await onRejectCall(callId, callType);
            }

            showToast.info('Call declined');
        } catch (error) {
            console.error('Error rejecting call:', error);
            setHasResponded(false);
            setResponse(null);
        }
    };

    return (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 my-2 max-w-md">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/20 rounded-full">
                    {callType === 'video' ? (
                        <Video className="w-5 h-5 text-primary" />
                    ) : (
                        <Phone className="w-5 h-5 text-primary" />
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-sm">
                        Group {callType === 'video' ? 'Video' : 'Voice'} Call
                    </h4>
                    <p className="text-xs text-base-content/60">
                        Started by {starterName}
                    </p>
                </div>
            </div>

            {/* Message */}
            <p className="text-sm mb-4 text-center">
                {callType === 'video' ? '📹' : '🎤'} {starterName} started a group {callType} call
            </p>

            {/* Action Buttons */}
            {!hasResponded ? (
                <div className="flex gap-2">
                    <button
                        onClick={handleJoin}
                        className="btn btn-success btn-sm flex-1 gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Join
                    </button>
                    <button
                        onClick={handleReject}
                        className="btn btn-error btn-sm flex-1 gap-2"
                    >
                        <X className="w-4 h-4" />
                        Decline
                    </button>
                </div>
            ) : (
                <div className={`text-center p-2 rounded ${response === 'joined'
                        ? 'bg-success/20 text-success'
                        : 'bg-error/20 text-error'
                    }`}>
                    <span className="text-sm font-medium">
                        {response === 'joined' ? '✅ Joined call' : '❌ Declined call'}
                    </span>
                </div>
            )}

            {/* Call ID for debugging */}
            <div className="text-xs text-base-content/40 text-center mt-2">
                Call ID: {callId.slice(-8)}
            </div>
        </div>
    );
};

export default GroupCallInviteMessage;