import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User, Clock } from 'lucide-react';
import { respondToCall } from '../lib/api';
import { showToast } from './Toast';
import { useNavigate } from 'react-router-dom';

const IncomingCallModal = ({ incomingCall, onClose }) => {
    const [isResponding, setIsResponding] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to respond
    const navigate = useNavigate();

    // Countdown timer
    useEffect(() => {
        if (!incomingCall) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Auto-reject when time runs out
                    handleReject();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [incomingCall]);

    const handleAccept = async () => {
        if (isResponding) return;

        setIsResponding(true);
        try {
            const response = await respondToCall(incomingCall.callId, 'accept');

            if (response.success) {
                showToast.success('Call accepted');
                onClose();

                // Navigate to call page
                navigate(`/call/${incomingCall.callId}?type=${incomingCall.callType}&accepted=true`);
            }
        } catch (error) {
            console.error('Error accepting call:', error);
            showToast.error('Failed to accept call');
        } finally {
            setIsResponding(false);
        }
    };

    const handleReject = async () => {
        if (isResponding) return;

        setIsResponding(true);
        try {
            await respondToCall(incomingCall.callId, 'reject');
            showToast.info('Call declined');
            onClose();
        } catch (error) {
            console.error('Error rejecting call:', error);
            showToast.error('Failed to decline call');
        } finally {
            setIsResponding(false);
        }
    };

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-8 max-w-md w-full mx-4 animate-pulse-slow">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {incomingCall.callType === 'video' ? (
                            <Video className="w-6 h-6 text-primary" />
                        ) : (
                            <Phone className="w-6 h-6 text-primary" />
                        )}
                        <h2 className="text-xl font-bold">
                            Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
                        </h2>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-1 text-sm text-base-content/60">
                        <Clock className="w-4 h-4" />
                        <span>{timeLeft}s remaining</span>
                    </div>
                </div>

                {/* Caller Info */}
                <div className="text-center mb-8">
                    <div className="avatar mb-4">
                        <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                            <img
                                src={incomingCall.caller.profilePic}
                                alt={incomingCall.caller.name}
                                className="object-cover"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(incomingCall.caller.name)}&background=random&color=fff`;
                                }}
                            />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2">{incomingCall.caller.name}</h3>

                    <div className="flex items-center justify-center gap-1 text-base-content/60">
                        <User className="w-4 h-4" />
                        <span>{incomingCall.participants} participant(s)</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    {/* Reject Button */}
                    <button
                        onClick={handleReject}
                        disabled={isResponding}
                        className="btn btn-circle btn-lg btn-error hover:btn-error-focus shadow-lg"
                        title="Decline call"
                    >
                        {isResponding ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <PhoneOff className="w-6 h-6" />
                        )}
                    </button>

                    {/* Accept Button */}
                    <button
                        onClick={handleAccept}
                        disabled={isResponding}
                        className="btn btn-circle btn-lg btn-success hover:btn-success-focus shadow-lg animate-bounce"
                        title="Accept call"
                    >
                        {isResponding ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : incomingCall.callType === 'video' ? (
                            <Video className="w-6 h-6" />
                        ) : (
                            <Phone className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;