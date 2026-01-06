import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '../lib/api';
import { Link } from 'react-router-dom';
import {
    Users,
    Plus,
    Video,
    Phone,
    Settings,
    UserPlus,
    Crown,
    MessageSquare,
    Search
} from 'lucide-react';
import { showToast } from '../components/Toast';
import useAuthUser from '../hooks/useAuthUser';
import CreateGroupModal from '../components/CreateGroupModal';

const GroupChatPage = () => {
    const { authUser, isAuthenticated } = useAuthUser();
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Debug logging
    console.log('GroupChatPage loaded:', { isAuthenticated, authUser: !!authUser });

    // Get user groups from API
    const { data: groupsData, isLoading: loadingGroups, error } = useQuery({
        queryKey: ["userGroups"],
        queryFn: getUserGroups,
        enabled: isAuthenticated,
    });

    const groups = groupsData?.groups || [];

    // Debug logging for groups
    console.log('Groups data:', { groupsCount: groups.length, loadingGroups, error });

    // Filter groups based on search query
    const filteredGroups = groups.filter(group => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            group.name?.toLowerCase().includes(query) ||
            group.description?.toLowerCase().includes(query)
        );
    });

    const isUserAdmin = (group) => {
        return group.admins?.some(admin => admin._id === authUser?._id) ||
            group.createdBy?._id === authUser?._id;
    };

    const handleJoinVideoCall = (groupName) => {
        showToast.success(`Starting video call in ${groupName}`);
        // TODO: Implement group video call
    };

    const handleJoinVoiceCall = (groupName) => {
        showToast.success(`Starting voice call in ${groupName}`);
        // TODO: Implement group voice call
    };

    const formatMemberCount = (members) => {
        if (!members || !Array.isArray(members)) return '0 members';
        const count = members.length;
        return `${count} member${count !== 1 ? 's' : ''}`;
    };

    return (
        <div className="min-h-screen bg-base-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Debug Info */}
                <div className="mb-4 p-2 bg-info/10 rounded text-sm">
                    <strong>Debug:</strong> Groups Page Loaded | Groups: {groups.length} | Loading: {loadingGroups ? 'Yes' : 'No'}
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Group Chats</h1>
                        <p className="text-base-content/70">Connect with multiple friends at once</p>
                    </div>
                    <button
                        onClick={() => setShowCreateGroup(true)}
                        className="btn btn-primary"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                    </button>
                </div>

                {/* Search */}
                {groups.length > 0 && (
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                className="input input-bordered w-full pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loadingGroups && (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <div className="alert alert-error max-w-md mx-auto">
                            <span>Failed to load groups. Please try again.</span>
                        </div>
                    </div>
                )}

                {/* Groups Grid */}
                {!loadingGroups && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGroups.map((group) => (
                            <div key={group._id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="card-body">
                                    {/* Group Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg truncate">{group.name}</h3>
                                                {isUserAdmin(group) && (
                                                    <Crown className="w-4 h-4 text-warning flex-shrink-0" title="Admin" />
                                                )}
                                            </div>
                                            <p className="text-sm opacity-70">{formatMemberCount(group.members)}</p>
                                        </div>
                                    </div>

                                    {/* Group Description */}
                                    {group.description && (
                                        <p className="text-sm opacity-80 mb-3 line-clamp-2">{group.description}</p>
                                    )}

                                    {/* Members Preview */}
                                    {group.members && group.members.length > 0 && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex -space-x-2">
                                                {group.members.slice(0, 3).map((member, index) => (
                                                    <div key={member._id || index} className="avatar">
                                                        <div className="w-6 h-6 rounded-full ring ring-base-100 ring-offset-1">
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
                                                ))}
                                                {group.members.length > 3 && (
                                                    <div className="avatar">
                                                        <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold">
                                                            +{group.members.length - 3}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-base-content/60">
                                                {group.members.slice(0, 2).map(m => m.fullName).join(', ')}
                                                {group.members.length > 2 && ` and ${group.members.length - 2} others`}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/groups/${group._id}`}
                                            className="btn btn-primary btn-sm flex-1"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            Chat
                                        </Link>

                                        <Link
                                            to={`/groups/${group._id}`}
                                            className="btn btn-outline btn-sm"
                                            title="Video Call"
                                        >
                                            <Video className="w-4 h-4" />
                                        </Link>

                                        <Link
                                            to={`/groups/${group._id}`}
                                            className="btn btn-outline btn-sm"
                                            title="Voice Call"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </Link>

                                        {isUserAdmin(group) && (
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => showToast.info(`Managing ${group.name}`)}
                                                title="Manage Group"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {filteredGroups.length === 0 && groups.length === 0 && !loadingGroups && (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-16 h-16 mx-auto text-base-content/40 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Groups Yet</h3>
                                <p className="text-base-content/60 mb-4">Create your first group to start chatting with multiple friends</p>
                                <button
                                    onClick={() => setShowCreateGroup(true)}
                                    className="btn btn-primary"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Group
                                </button>
                            </div>
                        )}

                        {/* No Search Results */}
                        {filteredGroups.length === 0 && groups.length > 0 && searchQuery && (
                            <div className="col-span-full text-center py-12">
                                <Search className="w-16 h-16 mx-auto text-base-content/40 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Groups Found</h3>
                                <p className="text-base-content/60 mb-4">Try adjusting your search terms</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="btn btn-ghost"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Group Modal */}
                <CreateGroupModal
                    isOpen={showCreateGroup}
                    onClose={() => setShowCreateGroup(false)}
                />
            </div>
        </div>
    );
};

export default GroupChatPage;