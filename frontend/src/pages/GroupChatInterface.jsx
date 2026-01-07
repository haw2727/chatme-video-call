import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups, getStreamToken } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import { useCallControls } from '../hooks/useCallControls';
import {
    ArrowLeft,
    Phone,
    Video,
    Users,
    Settings,
    Crown,
    PhoneOff
} from 'lucide-react';
import { showToast } from '../components/Toast';
import CallInterface from '../components/CallInterface';
import MembersSidebar from '../components/MembersSidebar';

// Stream Video imports
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall
} from '@stream-io/video-react-sdk';

// Stream Chat imports
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

    const [chatClient, setChatClient] = useState(null);
    const [videoClient, setVideoClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [detectedCallMode, setDetectedCallMode] = useState(null);
    const [detectedCallId, setDetectedCallId] = useState(null);

    // Get user groups
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

    // Initialize call controls
    const {
        call,
        callMode,
        activeCallId,
        startVoiceCall,
        startVideoCall,
        endCall,
        joinCall
    } = useCallControls(videoClient, currentGroup, authUser, channel);

    // Monitor chat messages for call status
    useEffect(() => {
        if (!channel || !currentGroup) return;

        const checkForActiveCalls = () => {
            const messages = channel.state.messages || [];
            const recentMessages = messages.slice(-10);

            const callStartMessage = recentMessages
                .reverse()
                .find(msg =>
                    msg.text?.includes('started a group') &&
                    msg.text?.includes('call') &&
                    !msg.text?.includes('joined') &&
                    !msg.text?.includes('ended')
                );

            const endMessage = recentMessages.find(msg =>
                msg.text?.includes('ended') ||
                msg.text?.includes('Call ended')
            );

            if (callStartMessage && (!endMessage || callStartMessage.created_at > endMessage.created_at)) {
                if (callStartMessage.text.includes('voice call')) {
                    setDetectedCallMode('voice');
                    setDetectedCallId(`group-voice-${currentGroup._id}`);
                } else if (callStartMessage.text.includes('video call')) {
                    setDetectedCallMode('video');
                    setDetectedCallId(`group-video-${currentGroup._id}`);
                }
            } else {
                setDetectedCallMode(null);
                setDetectedCallId(null);
            }
        };

        checkForActiveCalls();
        const handleNewMessage = () => checkForActiveCalls();
        channel.on('message.new', handleNewMessage);

        return () => {
            channel.off('message.new', handleNewMessage);
        };
    }, [channel, currentGroup]);

    // Use detected call mode if user is not in a call
    const displayCallMode = call ? callMode : detectedCallMode;
    const displayCallId = call ? activeCallId : detectedCallId;

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

                // Initialize Chat Client
                const chatClient = new StreamChat(STREAM_API_KEY);
                await chatClient.connectUser(user, tokenData);
                chatClientInstance = chatClient;

                // Get or create channel
                if (!currentGroup.streamChannelId) {
                    throw new Error('Group does not have a valid Stream channel ID');
                }

                const channel = chatClient.channel('messaging', currentGroup.streamChannelId, {
                    name: currentGroup.name,
                    members: currentGroup.members.map(m => m._id),
                });

                try {
                    await channel.watch();
                } catch (channelError) {
                    if (channelError.code === 16) {
                        await channel.create();
                        await channel.watch();
                    } else {
                        throw channelError;
                    }
                }

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
                if (!cancelled) {
                    showToast.error('Failed to connect to chat. Please try again.');
                    setIsConnecting(false);
                }
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
                    console.warn('Error during cleanup (this is normal during navigation):', err);
                } finally {
                    setChatClient(null);
                    setVideoClient(null);
                    setChannel(null);
                }
            })();
        };
    }, [authUser?._id, tokenData, currentGroup?._id, currentGroup?.streamChannelId]);

    // Handle joining a call from message button
    const handleJoinCall = async (callId, callType) => {
        await joinCall(callId, callType);
    };

    // Handle rejecting a call from message button
    const handleRejectCall = async (callId, callType) => {
        try {
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
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300 bg-base-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <button
                        onClick={() => navigate('/groups')}
                        className="btn btn-ghost btn-circle btn-sm flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="avatar flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <h1 className="font-bold text-base sm:text-lg truncate">{currentGroup.name}</h1>
                                {isUserAdmin(currentGroup) && (
                                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-warning flex-shrink-0" title="Admin" />
                                )}
                            </div>
                            <p className="text-sm text-base-content/60">
                                {currentGroup.members?.length || 0} members
                                {displayCallMode && !isUserAdmin(currentGroup) && (
                                    <>
                                        <span className="ml-2 text-success">
                                            • {displayCallMode === 'video' ? 'Video' : 'Voice'} call active
                                        </span>
                                        {!call && displayCallId && (
                                            <button
                                                onClick={async () => {
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
                                {displayCallMode && isUserAdmin(currentGroup) && (
                                    <span className="ml-2 text-success">
                                        • {displayCallMode === 'video' ? 'Video' : 'Voice'} call active (You started this call)
                                    </span>
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
                                    <CallInterface
                                        callMode={callMode}
                                        onEndCall={endCall}
                                        currentGroup={currentGroup}
                                        authUser={authUser}
                                        isAdmin={isUserAdmin(currentGroup)}
                                    />
                                </StreamCall>
                            </StreamVideo>
                        </div>
                    ) : (
                        /* Text Chat Interface */
                        <div className="flex-1">
                            {chatClient && channel && chatClient.user ? (
                                <Chat key={`${chatClient.userID}-${channel.id}`} client={chatClient} theme="str-chat__theme-light">
                                    <Channel
                                        channel={channel}
                                        acceptedFiles={['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/x-rar-compressed']}
                                        maxNumberOfFiles={5}
                                        multipleUploads={true}
                                    >
                                        <Window>
                                            <ChannelHeader />
                                            <MessageList />
                                            <MessageInput
                                                focus
                                                uploadButton={true}
                                                fileUploadConfig={{
                                                    multiple: true,
                                                    maxNumberOfFiles: 5,
                                                    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
                                                }}
                                            />
                                        </Window>
                                        <Thread />
                                    </Channel>
                                </Chat>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="loading loading-spinner loading-lg mb-4"></div>
                                        <p>Connecting to chat...</p>
                                    </div>
                                </div>
                            )}
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

export default GroupChatInterface;