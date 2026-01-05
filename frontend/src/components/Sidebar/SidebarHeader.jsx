import React from 'react';

const SidebarHeader = ({ user }) => {
    return (
        <div className="p-6 border-b border-base-300">
            <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="avatar online">
                    <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img
                            src={user?.profilePic || '/default-avatar.png'}
                            alt={user?.fullName || 'User'}
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=random`;
                            }}
                        />
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg truncate">
                        {user?.fullName || 'Loading...'}
                    </h2>
                    <p className="text-sm text-base-content/60 truncate">
                        {user?.email || ''}
                    </p>
                    {user?.bio && (
                        <p className="text-xs text-base-content/40 truncate mt-1">
                            {user.bio}
                        </p>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${user?.isOnline ? 'bg-success' : 'bg-base-content/30'}`} />
                    <span className="text-xs text-base-content/60">
                        {user?.isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* User Stats */}
            {user && (
                <div className="flex justify-between mt-4 pt-4 border-t border-base-300/50">
                    <div className="text-center">
                        <div className="font-semibold text-sm">
                            {user.friends?.length || 0}
                        </div>
                        <div className="text-xs text-base-content/60">Friends</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-sm">
                            {user.groups?.length || 0}
                        </div>
                        <div className="text-xs text-base-content/60">Groups</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-sm">
                            {user.chats?.length || 0}
                        </div>
                        <div className="text-xs text-base-content/60">Chats</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarHeader;