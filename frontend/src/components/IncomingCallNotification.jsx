import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { respondToCall } from '../lib/api';
import { showToast } from './Toast';

const IncomingCallNotification = ({ incomingCall, onClear }) => {
    const navigate = useNavigate();
    const [isResponding, setIsResponding] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (!incomingCall) return;

        // Play ringtone (optional - you can add audio later)
        // const audio = new Audio('/ringtone.mp3');
        // audio.loop = true;
        // audio.play();

        // Timer for call duration
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        // Auto-reject after 60 seconds
        const timeout = setTimeout(() => {
            handleReject();
        }, 60000);

        return () => {
            clearInterval(timer);
            clearTimeout(timeout);
            // audio.pause();
        };
    }, [incomingCall]);

    const handleAccept = async () => {
        if (isResponding || !incomingCall) return;

        setIsResponding(true);
        try {
            const response = await respondToCall(incomingCall.callId, 'accept');

            if (response.success) {
                showToast.success('Call accepted!');
                onClear();

                // Navigate to call page with accepted flag
                navigate(`/call/${incomingCall.callId}?type=${incomingCall.callType}&accepted=true&friends=${incomingCall.caller.id}`);
            }
        } catch (error) {
            console.error('Error accepting call:', error);
            showToast.error('Failed to accept call');
            setIsResponding(false);
        }
    };

    const handleReject = async () => {
        if (isResponding || !incomingCall) return;

        setIsResponding(true);
        try {
            await respondToCall(incomingCall.callId, 'reject');
            showToast.info('Call declined');
            onClear();
        } catch (error) {
            console.error('Error rejecting call:', error);
            showToast.error('Failed to decline call');
        } finally {
            setIsResponding(false);
        }
    };

    if (!incomingCall) return null;

    const isVideoCall = incomingCall.callType === 'video';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 max-w-md w-full animate-scale-in">
                {/* Call Type Icon */}
                <div className="flex justify-center mb-4 sm:mb-6">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${isVideoCall ? 'bg-green-500/20' : 'bg-blue-500/20'
                        } animate-pulse-slow`}>
                        {isVideoCall ? (
                            <Video className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                        ) : (
                            <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                        )}
                    </div>
                </div>

                {/* Caller Info */}
                <div className="text-center mb-4 sm:mb-6">
                    <div className="flex justify-center mb-3 sm:mb-4">
                        {incomingCall.caller.profilePic ? (
                            <img
                                src={incomingCall.caller.profilePic}
                                alt={incomingCall.caller.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white/30"
                            />
                        ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ring-4 ring-white/30">
                                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {incomingCall.caller.name}
                    </h2>

                    <p className="text-white/80 text-base sm:text-lg mb-1">
                        Incoming {isVideoCall ? 'Video' : 'Voice'} Call
                    </p>

                    <p className="text-white/60 text-sm">
                        {timeElapsed}s
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 sm:gap-4 justify-center">
                    {/* Reject Button */}
                    <button
                        onClick={handleReject}
                        disabled={isResponding}
                        className="btn btn-circle btn-lg bg-red-500 hover:bg-red-600 border-none text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        title="Decline"
                    >
                        <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Accept Button */}
                    <button
                        onClick={handleAccept}
                        disabled={isResponding}
                        className={`btn btn-circle btn-lg ${isVideoCall ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                            } border-none text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 animate-pulse-slow`}
                        title="Accept"
                    >
                        {isVideoCall ? (
                            <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                            <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                    </button>
                </div>

                {/* Loading State */}
                {isResponding && (
                    <div className="text-center mt-4">
                        <div className="loading loading-spinner loading-sm text-white"></div>
                        <p className="text-white/60 text-sm mt-2">Connecting...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomingCallNotification;
