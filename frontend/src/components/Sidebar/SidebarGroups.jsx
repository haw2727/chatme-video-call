import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '../../lib/api';
import useAuthUser from '../../hooks/useAuthUser';
import { Link } from 'react-router-dom';
import {
    Users,
    Crown,
    MessageSquare,
    Plus,
    Loader2
} from 'lucide-react';

const SidebarGroups = ({ onItemClick }) => {
    const { authUser, isAuthenticated } = useAuthUser();

    // Get user groups from API
    const { data: groupsData, isLoading: loadingGroups } = useQuery({
        queryKey: ["userGroups"],
        queryFn: getUserGroups,
        enabled: isAuthenticated,
        refetchInterval: 30000, // Refetch every 30 seconds to keep groups updated
    });

    const groups = groupsData?.groups || [];

    const isUserOwner = (group) => {
        return group.createdBy?._id === authUser?._id;
    };

    const formatMemberCount = (members) => {
        if (!members || !Array.isArray(members)) return '0';
        return members.length.toString();
    };

    return (
        <div className="px-4 py-2 border-t border-base-300/50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="px-4 text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    Your Groups ({groups.length})
                </h3>
                <Link
                    to="/groups"
                    onClick={onItemClick}
                    className="btn btn-ghost btn-xs"
                    title="View all groups"
                >
                    <Plus className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
                {loadingGroups ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-base-content/40" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-6">
                        <Users className="w-8 h-8 mx-auto mb-2 text-base-content/40" />
                        <p className="text-xs text-base-content/60 mb-2">No groups yet</p>
                        <Link
                            to="/groups"
                            onClick={onItemClick}
                            className="btn btn-xs btn-primary"
                        >
                            Create Group
                        </Link>
                    </div>
                ) : (
                    groups.slice(0, 8).map((group) => { // Show max 8 groups in sidebar
                        const isOwner = isUserOwner(group);
                        const memberCount = formatMemberCount(group.members);

                        return (
                            <Link
                                key={group._id}
                                to={`/groups/${group._id}`}
                                onClick={onItemClick}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-base-300 text-base-content group"
                                title={`${group.name} - ${memberCount} members`}
                            >
                                {/* Group Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                    {isOwner && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning text-warning-content rounded-full flex items-center justify-center">
                                            <Crown className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                </div>

                                {/* Group Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium text-sm truncate">{group.name}</span>
                                        {isOwner && (
                                            <span className="text-xs text-warning font-semibold flex-shrink-0">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                                        <span>{memberCount} members</span>
                                        {group.description && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate max-w-20">{group.description}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Message Indicator */}
                                <div className="flex-shrink-0">
                                    <MessageSquare className="w-4 h-4 text-base-content/40 group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        );
                    })
                )}

                {/* Show More Link */}
                {groups.length > 8 && (
                    <Link
                        to="/groups"
                        onClick={onItemClick}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-primary hover:text-primary-focus transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        View {groups.length - 8} more groups
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SidebarGroups;