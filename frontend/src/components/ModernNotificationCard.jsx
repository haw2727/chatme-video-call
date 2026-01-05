import React from 'react';
import { Check, X, Clock, User } from 'lucide-react';
import { getLanguageFlag, capitalize } from '../utils/languageUtils';

const ModernNotificationCard = ({
    request,
    onAccept,
    onReject,
    isLoading = false,
    type = 'incoming' // 'incoming' | 'outgoing' | 'accepted'
}) => {
    const user = type === 'incoming' ? request.from : request.to;

    const getStatusBadge = () => {
        switch (type) {
            case 'outgoing':
                return (
                    <div className="badge badge-warning badge-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </div>
                );
            case 'accepted':
                return (
                    <div className="badge badge-success badge-sm">
                        <Check className="w-3 h-3 mr-1" />
                        Friends
                    </div>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return `${Math.floor(diffInHours / 24)}d ago`;
        }
    };

    return (
        <div className="card bg-base-100 border border-base-300 hover:shadow-md transition-all duration-200">
            <div className="card-body p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                            <img
                                src={user?.profilePic || '/default-avatar.png'}
                                alt={user?.fullName}
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-semibold text-base truncate">{user?.fullName}</h4>
                                <p className="text-sm text-base-content/60">
                                    {type === 'incoming'
                                        ? 'wants to be your friend'
                                        : type === 'outgoing'
                                            ? 'Friend request sent'
                                            : 'You are now friends'
                                    }
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                {getStatusBadge()}
                                <span className="text-xs text-base-content/50">
                                    {formatDate(request.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Language Info */}
                        {user?.nativeLanguage && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                <div className="badge badge-outline badge-xs">
                                    {getLanguageFlag(user.nativeLanguage)} {capitalize(user.nativeLanguage)}
                                </div>
                                {user.learningLanguage && (
                                    <div className="badge badge-outline badge-xs">
                                        Learning {getLanguageFlag(user.learningLanguage)} {capitalize(user.learningLanguage)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bio Preview */}
                        {user?.bio && (
                            <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                                {user.bio}
                            </p>
                        )}

                        {/* Action Buttons */}
                        {type === 'incoming' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onAccept(request._id)}
                                    disabled={isLoading}
                                    className="btn btn-primary btn-sm flex-1"
                                >
                                    {isLoading ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Accept
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => onReject(request._id)}
                                    disabled={isLoading}
                                    className="btn btn-outline btn-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {type === 'accepted' && (
                            <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm flex-1">
                                    <User className="w-4 h-4 mr-1" />
                                    View Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernNotificationCard;