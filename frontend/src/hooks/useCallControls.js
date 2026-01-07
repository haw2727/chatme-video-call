import { useState } from 'react';
import { showToast } from '../components/Toast';

export const useCallControls = (videoClient, currentGroup, authUser, channel) => {
    const [call, setCall] = useState(null);
    const [callMode, setCallMode] = useState(null);
    const [activeCallId, setActiveCallId] = useState(null);

    const startVoiceCall = async () => {
        if (!currentGroup) {
            showToast.error('Group not found');
            return;
        }

        if (!videoClient) {
            showToast.error('Connecting to video service...');
            return;
        }

        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            const callId = `group-voice-${currentGroup._id}`;
            const callInstance = videoClient.call('default', callId);

            await callInstance.join({
                create: true,
                data: {
                    members: currentGroup.members.map(m => ({ user_id: m._id })),
                    settings_override: {
                        audio: {
                            mic_default_on: true,
                            default_device: 'speaker'
                        }
                    }
                }
            });

            // Enable microphone, disable camera
            if (callInstance.microphone) {
                await callInstance.microphone.enable();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (callInstance.camera) {
                await callInstance.camera.disable();
            }

            // Send notification
            if (channel) {
                await channel.sendMessage({
                    text: `🎤 ${authUser.fullName} started a group voice call! Click "Join Call" in the header to join.`,
                });
            }

            setCall(callInstance);
            setCallMode('voice');
            setActiveCallId(callId);

            showToast.success('Voice call started!');

        } catch (error) {
            console.error('Error starting voice call:', error);
            showToast.error(`Failed to start voice call: ${error.message}`);
        }
    };

    const startVideoCall = async () => {
        if (!currentGroup) {
            showToast.error('Group not found');
            return;
        }

        if (!videoClient) {
            showToast.error('Connecting to video service...');
            return;
        }

        try {
            // Request camera and microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

            const callId = `group-video-${currentGroup._id}`;
            const callInstance = videoClient.call('default', callId);

            await callInstance.join({
                create: true,
                data: {
                    members: currentGroup.members.map(m => ({ user_id: m._id })),
                    settings_override: {
                        audio: {
                            mic_default_on: true,
                            default_device: 'speaker'
                        },
                        video: {
                            camera_default_on: true,
                            target_resolution: {
                                width: 640,
                                height: 480
                            }
                        }
                    }
                }
            });

            // Enable microphone and camera
            if (callInstance.microphone) {
                await callInstance.microphone.enable();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (callInstance.camera) {
                await callInstance.camera.enable();
            }

            // Send notification
            if (channel) {
                await channel.sendMessage({
                    text: `📹 ${authUser.fullName} started a group video call! Click "Join Call" in the header to join.`,
                });
            }

            setCall(callInstance);
            setCallMode('video');
            setActiveCallId(callId);

            showToast.success('Video call started!');

        } catch (error) {
            console.error('Error starting video call:', error);
            showToast.error(`Failed to start video call: ${error.message}`);
        }
    };

    const endCall = async () => {
        if (call) {
            try {
                await call.leave();

                if (channel) {
                    await channel.sendMessage({
                        text: `📞 ${authUser.fullName} ended the ${callMode} call`,
                    });
                }

                setCall(null);
                setCallMode(null);
                setActiveCallId(null);

                showToast.success('Call ended');
            } catch (error) {
                console.error('Error ending call:', error);
            }
        }
    };

    const joinCall = async (callId, callType) => {
        if (!videoClient) {
            showToast.error('Connecting to video service...');
            return;
        }

        try {
            const callInstance = videoClient.call('default', callId);

            await callInstance.join({
                data: {
                    settings_override: {
                        audio: {
                            mic_default_on: true,
                            default_device: 'speaker'
                        },
                        video: {
                            camera_default_on: callType === 'video',
                            target_resolution: {
                                width: 640,
                                height: 480
                            }
                        }
                    }
                }
            });

            // Request permissions after joining
            const constraints = callType === 'video'
                ? { audio: true, video: true }
                : { audio: true, video: false };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(track => track.stop());

            // Enable microphone
            if (callInstance.microphone) {
                await callInstance.microphone.enable();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Handle camera
            if (callInstance.camera) {
                if (callType === 'video') {
                    await callInstance.camera.enable();
                } else {
                    await callInstance.camera.disable();
                }
            }

            setCall(callInstance);
            setCallMode(callType);

            // Send join notification
            if (channel) {
                await channel.sendMessage({
                    text: `✅ ${authUser.fullName} joined the ${callType} call`,
                });
            }

            showToast.success(`Joined ${callType} call successfully!`);

        } catch (error) {
            console.error('Error joining call:', error);
            if (error.message?.includes('target_resolution')) {
                showToast.error('Please allow camera and microphone access when your browser asks, then try again.');
            } else {
                showToast.error(`Failed to join ${callType} call: ${error.message}`);
            }
        }
    };

    return {
        call,
        callMode,
        activeCallId,
        startVoiceCall,
        startVideoCall,
        endCall,
        joinCall,
        setCall,
        setCallMode,
        setActiveCallId
    };
};