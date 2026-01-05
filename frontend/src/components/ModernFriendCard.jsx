import React from 'react';
import { MessageCircle, Video, Phone, MapPin, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModernFriendCard = ({ friend, onVideoCall, onVoiceCall }) => {
    const handleVideoCall = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onVideoCall?.(friend._id);
    };

    const handleVoiceCall = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onVoiceCall?.(friend._id);
    };

    return (
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300 group">
            <div className="card-body p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="avatar online">
                        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img
                                src={friend.profilePic || '/default-avatar.png'}
                                alt={friend.fullName}
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{friend.fullName}</h3>

                        {friend.location && (
                            <div className="flex items-center gap-1 text-sm text-base-content/60 mb-2">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{friend.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {friend.bio && (
                    <p className="text-sm text-base-content/70 line-clamp-2 mb-4">
                        {friend.bio}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    <Link
                        to={`/chat/${friend._id}`}
                        className="btn btn-primary btn-sm flex-1 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat
                    </Link>

                    <button
                        onClick={handleVideoCall}
                        className="btn btn-outline btn-sm hover:btn-success transition-colors duration-200"
                        title="Video Call"
                    >
                        <Video className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleVoiceCall}
                        className="btn btn-outline btn-sm hover:btn-info transition-colors duration-200"
                        title="Voice Call"
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
        </div>
    );
};

export default ModernFriendCard;