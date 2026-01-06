import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import {
    ArrowLeft,
    Send,
    Phone,
    Video,
    Users,
    Settings,
    Crown,
    MessageSquare
} from 'lucide-react';
import { showToast } from './Toast';

const SimpleGroupChat = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { authUser, isAuthenticated } = useAuthUser();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            user: 'System',
            text: 'Welcome to the group chat! Stream Chat integration is loading...',
            timestamp: new Date()
        }
    ]);

    // Get user groups to find the specific group
    const { data: groupsData, isLoading: loadingGroups } = useQuery({
        queryKey: ["userGroups"],
        queryFn: getUserGroups,
        enabled: isAuthenticated,
    });

    const groups = groupsData?.groups || [];
    const currentGroup = groups.find(g => g._id === groupId);

    const isUserAdmin = (group) => {
        return group?.admins?.some(admin => admin._id === authUser?._id) ||
            group?.createdBy?._id === authUser?._id;
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            user: authUser.fullName,
            text: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        showToast.info('Message sent (demo mode)');
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

    if (loadingGroups) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg mb-4"></div>
                    <p>Loading groups...</p>
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
                                {currentGroup.members?.length || 0} members • Demo Mode
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => showToast.info('Voice call feature coming soon!')}
                        className="btn btn-ghost btn-circle"
                        title="Start voice call"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => showToast.info('Video call feature coming soon!')}
                        className="btn btn-ghost btn-circle"
                        title="Start video call"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => showToast.info('Settings coming soon!')}
                        className="btn btn-ghost btn-circle"
                        title="Group settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="chat chat-start">
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                    {msg.user.charAt(0)}
                                </div>
                            </div>
                            <div className="chat-header">
                                {msg.user}
                                <time className="text-xs opacity-50 ml-2">
                                    {msg.timestamp.toLocaleTimeString()}
                                </time>
                            </div>
                            <div className="chat-bubble">{msg.text}</div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-base-300">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="input input-bordered flex-1"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!message.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SimpleGroupChat;