import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserFriends } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import { X, Search, MessageSquare, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast';

const NewChatModal = ({ isOpen, onClose }) => {
    const { isAuthenticated } = useAuthUser();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: friendsRaw, isLoading: loadingFriends } = useQuery({
        queryKey: ["userFriends"],
        queryFn: getUserFriends,
        enabled: isAuthenticated && isOpen,
    });

    const friends = Array.isArray(friendsRaw)
        ? friendsRaw
        : (friendsRaw?.data ?? friendsRaw?.friends ?? []);

    // Filter friends based on search query
    const filteredFriends = friends.filter(friend => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            friend.fullName?.toLowerCase().includes(query) ||
            friend.email?.toLowerCase().includes(query)
        );
    });

    const handleStartChat = (friend) => {
        navigate(`/chat/${friend._id}`);
        onClose();
        showToast.success(`Started chat with ${friend.fullName}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-md mx-4 max-h-[80vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">New Chat</h2>
                            <p className="text-sm text-base-content/60">Select a friend to start chatting</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-circle btn-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-base-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            className="input input-bordered w-full pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loadingFriends ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-lg" />
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery ? 'No friends found' : 'No friends yet'}
                            </h3>
                            <p className="text-base-content/60 mb-4">
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'Add some friends to start chatting'
                                }
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/');
                                    }}
                                    className="btn btn-primary btn-sm"
                                >
                                    Find Friends
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredFriends.map(friend => (
                                <button
                                    key={friend._id}
                                    onClick={() => handleStartChat(friend)}
                                    className="w-full p-3 rounded-xl border border-base-300 hover:border-primary/50 hover:bg-base-200 transition-all duration-200 text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="avatar online">
                                            <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                                                <img
                                                    src={friend.profilePic}
                                                    alt={friend.fullName}
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName)}&background=random&color=fff`;
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                                {friend.fullName}
                                            </h3>
                                            <p className="text-sm text-base-content/60 truncate">
                                                {friend.email}
                                            </p>
                                            {friend.location && (
                                                <p className="text-xs text-base-content/50 truncate">
                                                    {friend.location}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-xs text-success">
                                                <div className="w-2 h-2 bg-success rounded-full"></div>
                                                Online
                                            </div>
                                            <MessageSquare className="w-4 h-4 text-base-content/40 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-300 bg-base-200/50">
                    <div className="flex items-center justify-between text-sm text-base-content/60">
                        <span>{filteredFriends.length} friend(s) available</span>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;