import React from 'react';
import { MessageCircle, MapPin, Clock, Dot } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModernFriendCard = ({ friend }) => {
    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return null;
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div className="group relative bg-gradient-to-br from-base-100 to-base-200 rounded-2xl p-4 border border-base-300/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header with Avatar and Status */}
                <div className="flex flex-col items-center text-center mb-3">
                    <div className="relative mb-3">
                        <div className={`avatar ${friend.isOnline ? 'online' : 'offline'}`}>
                            <div className="w-14 h-14 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 group-hover:ring-primary/40 transition-all duration-300">
                                <img
                                    src={friend.profilePic || '/default-avatar.png'}
                                    alt={friend.fullName}
                                    className="object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName || 'User')}&background=random&color=fff`;
                                    }}
                                />
                            </div>
                        </div>

                        {/* Online Status Indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-base-100 ${friend.isOnline ? 'bg-success' : 'bg-base-300'
                            }`} />
                    </div>

                    {/* Name and Status */}
                    <div className="w-full">
                        <h3 className="font-bold text-sm truncate mb-1 group-hover:text-primary transition-colors duration-300">
                            {friend.fullName}
                        </h3>

                        {/* Status Text */}
                        <div className="flex items-center justify-center text-xs text-base-content/60 mb-2">
                            {friend.isOnline ? (
                                <div className="flex items-center gap-1">
                                    <Dot className="w-3 h-3 text-success animate-pulse" />
                                    <span className="text-success font-medium">Online</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatLastSeen(friend.lastSeen) || 'Offline'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location */}
                {friend.location && (
                    <div className="flex items-center justify-center gap-1 text-xs text-base-content/50 mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{friend.location}</span>
                    </div>
                )}

                {/* Bio */}
                {friend.bio && (
                    <p className="text-xs text-base-content/70 text-center line-clamp-2 mb-3 px-1">
                        {friend.bio}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="mt-auto space-y-2">
                    {/* Primary Chat Button */}
                    <Link
                        to={`/chat/${friend._id}`}
                        className="btn btn-primary btn-sm w-full text-xs h-8 min-h-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group/btn"
                    >
                        <MessageCircle className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform duration-200" />
                        Chat
                    </Link>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default ModernFriendCard;