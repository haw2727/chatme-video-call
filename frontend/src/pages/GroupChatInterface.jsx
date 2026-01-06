import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserGroups, getStreamToken } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import {
    ArrowLeft,
    Send,
    Smile,
    Paperclip,
    Phone,
    Video,
    Users,
    Settings,
    Crown,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    UserPlus,
    MoreVertical
} from 'lucide-react';
import { showToast } from '../components/Toast';
import CallInviteMessage from '../components/CallInviteMessage';
import CustomMessageRenderer from '../components/CustomMessageRenderer';

// Stream Video imports
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    SpeakerLayout,
    CallControls,
    StreamTheme,
    useCallStateHooks,
    CallingState
} from '@stream-io/video-react-sdk';

// Stream Chat imports - Fixed
import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageList,
    MessageInput,
    Thread,
    Window
} from 'stream-chat-react';

// CSS imports
import 'stream-chat-react/dist/css/v2/index.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatInterface = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { authUser, isAuthenticated } = useAuthUser();
    const queryClient = useQueryClient();

    // Check if Stream API key is available
    if (!STREAM_API_KEY) {
        console.error('VITE_STREAM_API_KEY is not configured');
    }

    const [chatClient, setChatClient] = useState(null);
    const [videoClient, setVideoClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [call, setCall] = useState(null);
    const [callMode, setCallMode] = useState(null); // 'voice' | 'video' | null
    const [activeCallId, setActiveCallId] = useState(null); // Store the current call ID
    const [isConnecting, setIsConnecting] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Check if there's an active call by looking at recent messages
    const [detectedCallMode, setDetectedCallMode] = useState(null);
    const [detectedCallId, setDetectedCallId] = useState(null);

    // Get user groups to find the specific group
    const { data: groupsData, isLoading: loadingGroups } = useQuery({
        queryKey: ["userGroups"],
        queryFn: getUserGroups,
        enabled: isAuthenticated,
    });

    // Get Stream token
    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    const groups = groupsData?.groups || [];
    const currentGroup = groups.find(g => g._id === groupId);

    // Monitor chat messages for call status
    useEffect(() => {
        if (!channel || !currentGroup) return;

        const checkForActiveCalls = () => {
            const messages = channel.state.messages || [];
            const recentMessages = messages.slice(-10); // Check last 10 messages

            // Look for call start messages
            const callStartMessage = recentMessages
                .reverse()
                .find(msg =>
                    msg.text?.includes('started a group') &&
                    msg.text?.includes('call') &&
                    !msg.text?.includes('joined') &&
                    !msg.text?.includes('ended')
                );

            if (callStartMessage) {
                if (callStartMessage.text.includes('voice call')) {
                    setDetectedCallMode('voice');
                    setDetectedCallId(`group-voice-${currentGroup._id}`);
                } else if (callStartMessage.text.includes('video call')) {
                    setDetectedCallMode('video');
                    setDetectedCallId(`group-video-${currentGroup._id}`);
                }
            } else {
                // Check if there's an end call message more recent than start
                const endMessage = recentMessages.find(msg =>
                    msg.text?.includes('ended') ||
                    msg.text?.includes('Call ended')
                );

                if (endMessage) {
                    setDetectedCallMode(null);
                    setDetectedCallId(null);
                }
            }
        };

        // Check initially
        checkForActiveCalls();

        // Listen for new messages
        const handleNewMessage = () => {
            checkForActiveCalls();
        };

        channel.on('message.new', handleNewMessage);

        return () => {
            channel.off('message.new', handleNewMessage);
        };
    }, [channel, currentGroup]);

    // Use detected call mode if user is not in a call
    const displayCallMode = call ? callMode : detectedCallMode;
    const displayCallId = call ? activeCallId : detectedCallId;

    // Debug logging
    console.log('GroupChatInterface Debug:', {
        groupId,
        groupsCount: groups.length,
        currentGroup: currentGroup ? currentGroup.name : 'Not found',
        isAuthenticated,
        tokenData: !!tokenData
    });

    const isUserAdmin = (group) => {
        return group?.admins?.some(admin => admin._id === authUser?._id) ||
            group?.createdBy?._id === authUser?._id;
    };

    // Initialize Stream Chat and Video clients
    useEffect(() => {
        let chatClientInstance = null;
        let videoClientInstance = null;
        let cancelled = false;

        const initClients = async () => {
            if (!authUser || !tokenData || !currentGroup) return;

            if (!STREAM_API_KEY) {
                console.error('Stream API key is not configured');
                showToast.error('Chat service is not configured. Please contact support.');
                setIsConnecting(false);
                return;
            }

            try {
                const user = {
                    id: authUser._id,
                    name: authUser.fullName,
                    image: authUser.profilePic,
                };

                // Initialize Chat Client - Fixed for correct version
                console.log('Initializing StreamChat with API key:', STREAM_API_KEY ? 'Present' : 'Missing');
                console.log('User data:', user);
                console.log('Token data:', tokenData ? 'Present' : 'Missing');

                const chatClient = new StreamChat(STREAM_API_KEY);
                if (!chatClient) {
                    throw new Error('Failed to create StreamChat instance');
                }

                console.log('Connecting user to StreamChat...');
                await chatClient.connectUser(user, tokenData);
                console.log('StreamChat user connected successfully');
                chatClientInstance = chatClient;

                // Get or create channel
                console.log('Creating channel for group:', currentGroup.name, 'with ID:', currentGroup.streamChannelId);
                const channel = chatClient.channel('messaging', currentGroup.streamChannelId, {
                    name: currentGroup.name,
                    members: currentGroup.members.map(m => m._id),
                });
                console.log('Watching channel...');
                await channel.watch();
                console.log('Channel ready:', channel.id);

                // Initialize Video Client
                const videoClient = new StreamVideoClient({
                    apiKey: STREAM_API_KEY,
                    user,
                    token: tokenData,
                });
                videoClientInstance = videoClient;

                if (cancelled) return;

                setChatClient(chatClient);
                setVideoClient(videoClient);
                setChannel(channel);
                setIsConnecting(false);

            } catch (error) {
                console.error('Error initializing clients:', error);
                showToast.error('Failed to connect to chat. Please try again.');
                setIsConnecting(false);
            }
        };

        initClients();

        return () => {
            cancelled = true;
            (async () => {
                try {
                    if (call?.leave) await call.leave();
                    if (videoClientInstance?.disconnect) await videoClientInstance.disconnect();
                    if (chatClientInstance?.disconnectUser) await chatClientInstance.disconnectUser();
                } catch (err) {
                    console.warn('Error during cleanup', err);
                } finally {
                    setChatClient(null);
                    setVideoClient(null);
                    setChannel(null);
                    setCall(null);
                }
            })();
        };
    }, [authUser, tokenData, currentGroup]);

    const startVoiceCall = async () => {
        if (!videoClient || !currentGroup) {
            showToast.error('Video client or group not available');
            console.error('Missing requirements:', { videoClient: !!videoClient, currentGroup: !!currentGroup });
            return;
        }

        // Check if user is admin
        if (!isUserAdmin(currentGroup)) {
            showToast.error('Only group admins can start calls');
            return;
        }

        try {
            console.log('Starting voice call...');
            // Use a simple, predictable call ID that all members can use
            const callId = `group-voice-${currentGroup._id}`;
            console.log('Call ID:', callId);

            // Create call instance
            const callInstance = videoClient.call('default', callId);
            console.log('Call instance created:', !!callInstance);

            // Join the call with simpler settings
            console.log('Joining call...');
            await callInstance.join({
                create: true,
                data: {
                    members: currentGroup.members.map(m => ({ user_id: m._id }))
                }
            });
            console.log('Call joined successfully');

            // Disable camera for voice call
            if (callInstance.camera) {
                await callInstance.camera.disable();
                console.log('Camera disabled');
            }

            // Send simple chat message notification
            if (channel) {
                try {
                    await channel.sendMessage({
                        text: `🎤 ${authUser.fullName} started a group voice call! Click "Join Call" in the header to join.`,
                    });
                    console.log('Chat notification sent');
                } catch (chatError) {
                    console.warn('Failed to send chat notification:', chatError);
                }
            }

            setCall(callInstance);
            setCallMode('voice');
            setActiveCallId(callId); // Store the call ID
            showToast.success(`Voice call started! Members can join from the chat message.`);
            console.log('Voice call setup complete');

        } catch (error) {
            console.error('Error starting voice call:', error);
            showToast.error(`Failed to start voice call: ${error.message}`);
        }
    };

    const startVideoCall = async () => {
        if (!videoClient || !currentGroup) {
            showToast.error('Video client or group not available');
            console.error('Missing requirements:', { videoClient: !!videoClient, currentGroup: !!currentGroup });
            return;
        }

        // Check if user is admin
        if (!isUserAdmin(currentGroup)) {
            showToast.error('Only group admins can start calls');
            return;
        }

        try {
            console.log('Starting video call...');
            // Use a simple, predictable call ID that all members can use
            const callId = `group-video-${currentGroup._id}`;
            console.log('Call ID:', callId);

            // Create call instance
            const callInstance = videoClient.call('default', callId);
            console.log('Call instance created:', !!callInstance);

            // Join the call with simpler settings
            console.log('Joining video call...');
            await callInstance.join({
                create: true,
                data: {
                    members: currentGroup.members.map(m => ({ user_id: m._id }))
                }
            });
            console.log('Video call joined successfully');

            // Send simple chat message notification
            if (channel) {
                try {
                    await channel.sendMessage({
                        text: `📹 ${authUser.fullName} started a group video call! Click "Join Call" in the header to join.`,
                    });
                    console.log('Chat notification sent');
                } catch (chatError) {
                    console.warn('Failed to send chat notification:', chatError);
                }
            }

            setCall(callInstance);
            setCallMode('video');
            setActiveCallId(callId); // Store the call ID
            showToast.success(`Video call started! Members can join from the chat message.`);
            console.log('Video call setup complete');

        } catch (error) {
            console.error('Error starting video call:', error);
            showToast.error(`Failed to start video call: ${error.message}`);
        }
    };

    const endCall = async () => {
        if (call) {
            try {
                await call.leave();

                // Send end call message to notify all members
                if (channel) {
                    await channel.sendMessage({
                        text: `📞 ${authUser.fullName} ended the ${callMode} call`,
                    });
                }

                setCall(null);
                setCallMode(null);
                setActiveCallId(null); // Clear the call ID
                showToast.success('Call ended');
            } catch (error) {
                console.error('Error ending call:', error);
            }
        }
    };

    // Handle joining a call from message button
    const handleJoinCall = async (callId, callType) => {
        if (!videoClient) {
            showToast.error('Video client not available');
            return;
        }

        try {
            console.log(`Joining ${callType} call:`, callId);

            // Create call instance with the same ID
            const callInstance = videoClient.call('default', callId);

            // Join the existing call
            await callInstance.join();
            console.log('Successfully joined call');

            // Set camera based on call type
            if (callType === 'voice' && callInstance.camera) {
                await callInstance.camera.disable();
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
            showToast.error(`Failed to join ${callType} call: ${error.message}`);
        }
    };

    // Handle rejecting a call from message button
    const handleRejectCall = async (callId, callType) => {
        try {
            console.log(`Rejecting ${callType} call:`, callId);

            // Send rejection notification
            if (channel) {
                await channel.sendMessage({
                    text: `❌ ${authUser.fullName} declined the ${callType} call`,
                });
            }

            showToast.info(`Declined ${callType} call`);
        } catch (error) {
            console.error('Error rejecting call:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
                    <p className="text-base-content/60 mb-4">Please log in to access group chat.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (isConnecting || loadingGroups) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg mb-4"></div>
                    <p>
                        {loadingGroups ? 'Loading groups...' : 'Connecting to group chat...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!currentGroup) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
                    <h2 className="text-xl font-bold mb-2">Group Not Found</h2>
                    <p className="text-base-content/60 mb-4">The group you're looking for doesn't exist or you don't have access.</p>
                    <button
                        onClick={() => navigate('/groups')}
                        className="btn btn-primary"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Groups
                    </button>
                </div>
            </div>
        );
    }

    if (!chatClient || !channel) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="alert alert-error">
                        <span>Failed to connect to chat. Please refresh the page.</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-base-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/groups')}
                        className="btn btn-ghost btn-circle btn-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-lg">{currentGroup.name}</h1>
                                {isUserAdmin(currentGroup) && (
                                    <Crown className="w-4 h-4 text-warning" title="Admin" />
                                )}
                            </div>
                            <p className="text-sm text-base-content/60">
                                {currentGroup.members?.length || 0} members
                                {displayCallMode && (
                                    <>
                                        <span className="ml-2 text-success">
                                            • {displayCallMode === 'video' ? 'Video' : 'Voice'} call active
                                        </span>
                                        {!call && displayCallId && (
                                            <button
                                                onClick={async () => {
                                                    // Join the active call using detected call ID
                                                    if (videoClient && displayCallId) {
                                                        try {
                                                            await handleJoinCall(displayCallId, displayCallMode);
                                                        } catch (error) {
                                                            console.error('Error joining call:', error);
                                                            showToast.error('Failed to join call');
                                                        }
                                                    }
                                                }}
                                                className="ml-2 btn btn-success btn-xs"
                                            >
                                                Join Call
                                            </button>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Call Controls - Admin Only */}
                    {!call ? (
                        <>
                            {isUserAdmin(currentGroup) ? (
                                <>
                                    <div className="tooltip tooltip-bottom" data-tip="Start group voice call (Admin only)">
                                        <button
                                            onClick={startVoiceCall}
                                            className="btn btn-ghost btn-circle hover:btn-success"
                                        >
                                            <Phone className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="tooltip tooltip-bottom" data-tip="Start group video call (Admin only)">
                                        <button
                                            onClick={startVideoCall}
                                            className="btn btn-ghost btn-circle hover:btn-primary"
                                        >
                                            <Video className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="tooltip tooltip-bottom" data-tip="Only admins can start calls">
                                        <button
                                            className="btn btn-ghost btn-circle opacity-50 cursor-not-allowed"
                                            disabled
                                        >
                                            <Phone className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="tooltip tooltip-bottom" data-tip="Only admins can start calls">
                                        <button
                                            className="btn btn-ghost btn-circle opacity-50 cursor-not-allowed"
                                            disabled
                                        >
                                            <Video className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="tooltip tooltip-bottom" data-tip="End call">
                            <button
                                onClick={endCall}
                                className="btn btn-error btn-circle animate-pulse"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setShowMembers(!showMembers)}
                        className="btn btn-ghost btn-circle"
                        title="Group members"
                    >
                        <Users className="w-5 h-5" />
                    </button>

                    {isUserAdmin(currentGroup) && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="btn btn-ghost btn-circle"
                            title="Group settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {call && videoClient ? (
                        /* Call Interface */
                        <div className="flex-1 bg-gray-900 relative">
                            <StreamVideo client={videoClient}>
                                <StreamCall call={call}>
                                    <CallInterface callMode={callMode} onEndCall={endCall} />
                                </StreamCall>
                            </StreamVideo>
                        </div>
                    ) : (
                        /* Text Chat Interface */
                        <div className="flex-1">
                            <Chat client={chatClient} theme="str-chat__theme-light">
                                <Channel channel={channel}>
                                    <Window>
                                        <ChannelHeader />
                                        <MessageList />
                                        <MessageInput />
                                    </Window>
                                    <Thread />
                                </Channel>
                            </Chat>
                        </div>
                    )}
                </div>

                {/* Members Sidebar */}
                {showMembers && (
                    <div className="w-80 border-l border-base-300 bg-base-200/50">
                        <MembersSidebar
                            group={currentGroup}
                            isAdmin={isUserAdmin(currentGroup)}
                            onClose={() => setShowMembers(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Call Interface Component
const CallInterface = ({ callMode, onEndCall }) => {
    const { useCallCallingState, useParticipants } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participants = useParticipants();

    if (callingState === CallingState.JOINING) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">Joining Call...</h2>
                    <p className="text-gray-300">
                        {callMode === 'video' ? 'Video' : 'Voice'} call with group members
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {callMode === 'video' ? (
                <StreamTheme className="flex-1">
                    <SpeakerLayout />
                </StreamTheme>
            ) : (
                /* Voice Call UI */
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                            {participants.map((participant) => (
                                <div key={participant.sessionId} className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 ring-4 ring-white/20">
                                        <img
                                            src={participant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random&color=fff`}
                                            alt={participant.name}
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-lg">{participant.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {participant.audioEnabled ? (
                                            <Mic className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <MicOff className="w-4 h-4 text-red-400" />
                                        )}
                                        <span className="text-sm text-gray-300">
                                            {participant.audioEnabled ? 'Speaking' : 'Muted'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Group Voice Call</h2>
                        <p>You're in a voice call with {participants.length - 1} other(s)</p>
                    </div>
                </div>
            )}

            {/* Call Controls */}
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

// Members Sidebar Component
const MembersSidebar = ({ group, isAdmin, onClose }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Members ({group.members?.length || 0})</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-circle btn-sm"
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {group.members?.map((member) => (
                        <div key={member._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300">
                            <div className="avatar online">
                                <div className="w-10 h-10 rounded-full">
                                    <img
                                        src={member.profilePic}
                                        alt={member.fullName}
                                        className="object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random&color=fff`;
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{member.fullName}</span>
                                    {group.createdBy?._id === member._id && (
                                        <Crown className="w-4 h-4 text-warning" title="Owner" />
                                    )}
                                    {group.admins?.some(admin => admin._id === member._id) && (
                                        <span className="badge badge-primary badge-sm">Admin</span>
                                    )}
                                </div>
                                <p className="text-sm text-base-content/60">{member.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isAdmin && (
                <div className="p-4 border-t border-base-300">
                    <button className="btn btn-primary btn-sm w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Members
                    </button>
                </div>
            )}
        </div>
    );
};

export default GroupChatInterface;