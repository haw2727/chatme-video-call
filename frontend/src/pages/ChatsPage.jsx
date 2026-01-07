import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';
import { useStreamChat } from '../contexts/StreamChatContext';
import {
    MessageSquare,
    Search,
    Plus,
    ArrowRight,
    Loader2,
    MessageCircle
} from 'lucide-react';
import { showToast } from '../components/Toast';

const ChatsPage = () => {
    const navigate = useNavigate();
    const { authUser, isAuthenticated } = useAuthUser();
    const { chatClient, isConnected, isConnecting } = useStreamChat();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadChannels = async () => {
            if (!authUser || !chatClient || !isConnected || !isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Query for channels where user is a member
                const filter = {
                    type: 'messaging',
                    members: { $in: [authUser._id] }
                };

                const sort = { last_message_at: -1 };
                const options = { limit: 50 };

                const channelsResponse = await chatClient.queryChannels(filter, sort, options);

                if (!cancelled) {
                    // Filter out channels that are just user talking to themselves
                    const validChats = channelsResponse.filter(channel => {
                        const members = Object.keys(channel.state.members);
                        return members.length > 1;
                    });

                    setChannels(validChats);
                }
            } catch (error) {
                console.error('Error loading channels:', error);
                if (!cancelled) {
                    showToast.error('Failed to load chats');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (chatClient && isConnected) {
            loadChannels();
        } else {
            setLoading(true);
        }

        return () => {
            cancelled = true;
        };
    }, [authUser, chatClient, isConnected, isAuthenticated]);

    const filteredChannels = channels.filter(channel => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        const members = Object.values(channel.state.members);
        const otherMember = members.find(member => member.user.id !== authUser._id);

        return otherMember?.user?.name?.toLowerCase().includes(query) ||
            channel.data?.name?.toLowerCase().includes(query);
    });

    const formatLastMessage = (channel) => {
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        if (!lastMessage) return 'No messages yet';

        if (lastMessage.text) {
            return lastMessage.text.length > 50
                ? lastMessage.text.substring(0, 50) + '...'
                : lastMessage.text;
        }

        if (lastMessage.attachments?.length > 0) {
            return '📎 Attachment';
        }

        return 'Message';
    };

    const formatLastMessageTime = (channel) => {
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        if (!lastMessage) return '';

        const messageDate = new Date(lastMessage.created_at);
        const now = new Date();
        const diffInHours = (now - messageDate) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 168) { // 7 days
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return messageDate.toLocaleDateString();
        }
    };

    const getOtherMember = (channel) => {
        const members = Object.values(channel.state.members);
        return members.find(member => member.user.id !== authUser._id)?.user;
    };

    const handleChatClick = (channel) => {
        const otherMember = getOtherMember(channel);
        if (otherMember) {
            navigate(`/chat/${otherMember.id}`);
        }
    };

    const handleNewChat = () => {
        navigate('/');
        showToast.info('Select a friend from the home page to start a new chat');
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isConnecting || (!isConnected && !loading)) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-base-content/70">Connecting to chat service...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
            {/* Header */}
            <div className="flex-shrink-0 bg-base-100 border-b border-base-300/50 shadow-sm">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                                <MessageSquare className="w-8 h-8 text-primary" />
                                Your Chats
                            </h1>
                            <p className="text-base-content/70 mt-1">
                                {channels.length} conversation{channels.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={handleNewChat}
                            className="btn btn-primary btn-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Chat
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="input input-bordered w-full pl-10 bg-base-100/50 backdrop-blur-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Chats List */}
                    <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-sm border border-base-300/50">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="ml-3 text-base-content/70">Loading chats...</span>
                            </div>
                        ) : filteredChannels.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto border border-base-300/30">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {searchQuery ? 'No chats found' : 'No conversations yet'}
                                    </h3>
                                    <p className="text-base-content/60 text-sm mb-4">
                                        {searchQuery
                                            ? 'Try adjusting your search terms'
                                            : 'Start a conversation with your friends'
                                        }
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={handleNewChat}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Start Your First Chat
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-base-300/50">
                                {filteredChannels.map((channel) => {
                                    const otherMember = getOtherMember(channel);
                                    const lastMessage = formatLastMessage(channel);
                                    const lastMessageTime = formatLastMessageTime(channel);
                                    const unreadCount = channel.countUnread();

                                    return (
                                        <div
                                            key={channel.id}
                                            onClick={() => handleChatClick(channel)}
                                            className="p-4 hover:bg-base-200/50 transition-all duration-200 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Avatar */}
                                                <div className="avatar">
                                                    <div className="w-12 h-12 rounded-full ring ring-primary/20 ring-offset-base-100 ring-offset-1 group-hover:ring-primary/40 transition-all duration-200">
                                                        <img
                                                            src={otherMember?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherMember?.name || 'User')}&background=random&color=fff`}
                                                            alt={otherMember?.name || 'User'}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors duration-200">
                                                            {otherMember?.name || 'Unknown User'}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            {lastMessageTime && (
                                                                <span className="text-xs text-base-content/50">
                                                                    {lastMessageTime}
                                                                </span>
                                                            )}
                                                            <ArrowRight className="w-4 h-4 text-base-content/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-base-content/70 truncate">
                                                            {lastMessage}
                                                        </p>
                                                        {unreadCount > 0 && (
                                                            <div className="badge badge-primary badge-sm ml-2">
                                                                {unreadCount > 99 ? '99+' : unreadCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatsPage;