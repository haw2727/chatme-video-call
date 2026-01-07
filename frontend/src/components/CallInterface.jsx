import React from 'react';
import {
    SpeakerLayout,
    StreamTheme,
    useCallStateHooks,
    useCall,
    CallingState
} from '@stream-io/video-react-sdk';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { showToast } from './Toast';

const CallInterface = ({ callMode, onEndCall, currentGroup, authUser, isAdmin }) => {
    const call = useCall();
    const { useCallCallingState, useParticipants, useLocalParticipant, useMicrophoneState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participants = useParticipants();
    const localParticipant = useLocalParticipant();
    const { microphone, isMute } = useMicrophoneState();

    // Toggle microphone for self
    const toggleOwnMicrophone = async () => {
        try {
            if (call?.microphone) {
                if (!isMute) {
                    await call.microphone.disable();
                    showToast.info('You muted yourself');
                } else {
                    await call.microphone.enable();
                    showToast.info('You unmuted yourself');
                }
            }
        } catch (error) {
            console.error('Error toggling own microphone:', error);
            showToast.error('Failed to toggle microphone');
        }
    };

    // Get microphone state for a participant
    const getParticipantMicState = (participant) => {
        if (participant.userId === authUser?._id) {
            // For current user, use the microphone state hook
            return !isMute;
        } else {
            // For other participants, use their audioEnabled state
            return participant.audioEnabled;
        }
    };

    // Check if current user can control a participant's microphone
    const canControlMicrophone = (participant) => {
        if (participant.userId === authUser?._id) return true;
        return isAdmin;
    };

    // Get the appropriate click handler for a participant
    const getMicrophoneClickHandler = (participant) => {
        if (participant.userId === authUser?._id) {
            return toggleOwnMicrophone;
        }
        return null;
    };

    if (callingState === CallingState.JOINING) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">Joining Call...</h2>
                    <p className="text-gray-300">
                        {callMode === 'video' ? 'Connecting to video call...' : 'Connecting to voice call...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {callMode === 'video' ? (
                <div className="flex-1 relative">
                    <StreamTheme className="h-full">
                        <SpeakerLayout />
                    </StreamTheme>

                    {/* Video Call Participant Controls Overlay */}
                    <div className="absolute bottom-20 left-4 right-4 z-10">
                        <div className="flex flex-wrap justify-center gap-2">
                            {participants.map((participant) => {
                                const clickHandler = getMicrophoneClickHandler(participant);
                                const canControl = canControlMicrophone(participant);
                                const isCurrentUser = participant.userId === authUser?._id;
                                const isMicEnabled = getParticipantMicState(participant);

                                return (
                                    <div key={participant.sessionId} className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                                        <span className="text-white text-sm font-medium">
                                            {participant.name}
                                            {isCurrentUser && <span className="text-gray-300 ml-1">(You)</span>}
                                        </span>
                                        <button
                                            onClick={clickHandler}
                                            disabled={!canControl}
                                            className={`btn btn-circle btn-xs ${isMicEnabled
                                                ? 'btn-success hover:btn-success-focus'
                                                : 'btn-error hover:btn-error-focus'
                                                } ${!canControl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={
                                                !canControl
                                                    ? 'Cannot control this microphone'
                                                    : isCurrentUser
                                                        ? (isMicEnabled ? 'Mute yourself' : 'Unmute yourself')
                                                        : (isMicEnabled ? `Request ${participant.name} to mute` : `Request ${participant.name} to unmute`)
                                            }
                                        >
                                            {isMicEnabled ? (
                                                <Mic className="w-3 h-3" />
                                            ) : (
                                                <MicOff className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Voice Call UI */
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                            {participants.map((participant) => {
                                const clickHandler = getMicrophoneClickHandler(participant);
                                const canControl = canControlMicrophone(participant);
                                const isCurrentUser = participant.userId === authUser?._id;
                                const isMicEnabled = getParticipantMicState(participant);

                                return (
                                    <div key={participant.sessionId} className="flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 ring-4 ring-white/20">
                                            <img
                                                src={participant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random&color=fff`}
                                                alt={participant.name}
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        </div>
                                        <h3 className="font-semibold text-lg">
                                            {participant.name}
                                            {isCurrentUser && <span className="text-sm text-gray-400 ml-1">(You)</span>}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                onClick={clickHandler}
                                                disabled={!canControl}
                                                className={`btn btn-circle btn-sm ${isMicEnabled
                                                    ? 'btn-success hover:btn-success-focus'
                                                    : 'btn-error hover:btn-error-focus'
                                                    } ${!canControl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={
                                                    !canControl
                                                        ? 'Cannot control this microphone'
                                                        : isCurrentUser
                                                            ? (isMicEnabled ? 'Mute yourself' : 'Unmute yourself')
                                                            : (isMicEnabled ? `Request ${participant.name} to mute` : `Request ${participant.name} to unmute`)
                                                }
                                            >
                                                {isMicEnabled ? (
                                                    <Mic className="w-4 h-4" />
                                                ) : (
                                                    <MicOff className="w-4 h-4" />
                                                )}
                                            </button>
                                            <span className="text-sm text-gray-300">
                                                {isMicEnabled ? 'Speaking' : 'Muted'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Group Voice Call</h2>
                        <p>You're in a voice call with {participants.length - 1} other(s)</p>
                    </div>
                </div>
            )}

            {/* Call Controls - Only End Call Button */}
            <div className="p-6 bg-gray-800/50 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                    <button
                        onClick={onEndCall}
                        className="btn btn-circle btn-lg btn-error hover:btn-error-focus"
                        title="End call"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;