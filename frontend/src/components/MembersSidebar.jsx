import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPotentialMembers, addMemberToGroup, removeMemberFromGroup } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import { Search, Check, User, UserPlus } from 'lucide-react';
import { showToast } from './Toast';

const MembersSidebar = ({ group, isAdmin, onClose }) => {
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();

    // Get potential members (friends not in group)
    const { data: potentialMembersData, isLoading: loadingPotential } = useQuery({
        queryKey: ["potentialMembers", group._id],
        queryFn: () => getPotentialMembers(group._id),
        enabled: showAddMembers && isAdmin,
    });

    // Add member mutation
    const addMemberMutation = useMutation({
        mutationFn: ({ groupId, userId }) => addMemberToGroup(groupId, userId),
        onSuccess: (data) => {
            showToast.success('Member added successfully!');
            queryClient.setQueryData(['userGroups'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    groups: oldData.groups.map(g =>
                        g._id === group._id
                            ? { ...g, members: data.group.members }
                            : g
                    )
                };
            });
            setShowAddMembers(false);
            setSelectedMembers([]);
            setSearchQuery('');
        },
        onError: (error) => {
            showToast.error(error.response?.data?.message || 'Failed to add member');
        }
    });

    // Remove member mutation
    const removeMemberMutation = useMutation({
        mutationFn: ({ groupId, memberId }) => removeMemberFromGroup(groupId, memberId),
        onSuccess: (data) => {
            showToast.success('Member removed successfully!');
            queryClient.setQueryData(['userGroups'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    groups: oldData.groups.map(g =>
                        g._id === group._id
                            ? { ...g, members: data.group.members }
                            : g
                    )
                };
            });
        },
        onError: (error) => {
            showToast.error(error.response?.data?.message || 'Failed to remove member');
        }
    });

    const potentialMembers = potentialMembersData?.potentialMembers || [];

    const filteredPotentialMembers = potentialMembers.filter(member => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            member.fullName?.toLowerCase().includes(query) ||
            member.email?.toLowerCase().includes(query)
        );
    });

    const handleMemberToggle = (member) => {
        setSelectedMembers(prev => {
            const isSelected = prev.find(m => m._id === member._id);
            if (isSelected) {
                return prev.filter(m => m._id !== member._id);
            } else {
                return [...prev, member];
            }
        });
    };

    const handleAddMembers = async () => {
        if (selectedMembers.length === 0) {
            showToast.error('Please select at least one member to add');
            return;
        }

        for (const member of selectedMembers) {
            try {
                await addMemberMutation.mutateAsync({
                    groupId: group._id,
                    userId: member._id
                });
            } catch (error) {
                console.error(`Failed to add ${member.fullName}:`, error);
            }
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
            try {
                await removeMemberMutation.mutateAsync({
                    groupId: group._id,
                    memberId: memberId
                });
            } catch (error) {
                console.error(`Failed to remove ${memberName}:`, error);
            }
        }
    };

    const canRemoveMember = (member) => {
        if (member._id === authUser?._id) return false;
        if (group.createdBy?._id === member._id) return false;
        return isAdmin;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">
                        {showAddMembers ? 'Add Members' : `Members (${group.members?.length || 0})`}
                    </h3>
                    <button
                        onClick={() => {
                            if (showAddMembers) {
                                setShowAddMembers(false);
                                setSelectedMembers([]);
                                setSearchQuery('');
                            } else {
                                onClose();
                            }
                        }}
                        className="btn btn-ghost btn-circle btn-sm"
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {showAddMembers ? (
                    /* Add Members Interface */
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                className="input input-bordered input-sm w-full pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Selected Members */}
                        {selectedMembers.length > 0 && (
                            <div className="bg-base-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="w-4 h-4 text-success" />
                                    <span className="font-semibold text-sm">Selected ({selectedMembers.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {selectedMembers.map(member => (
                                        <div key={member._id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                            <span>{member.fullName}</span>
                                            <button
                                                onClick={() => handleMemberToggle(member)}
                                                className="text-primary hover:text-primary-focus"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Potential Members List */}
                        <div className="space-y-2">
                            {loadingPotential ? (
                                <div className="flex justify-center py-4">
                                    <span className="loading loading-spinner loading-sm" />
                                </div>
                            ) : filteredPotentialMembers.length === 0 ? (
                                <div className="text-center py-4">
                                    <User className="w-8 h-8 mx-auto mb-2 text-base-content/40" />
                                    <p className="text-sm text-base-content/60">
                                        {searchQuery ? 'No friends found' : 'No friends available to add'}
                                    </p>
                                </div>
                            ) : (
                                filteredPotentialMembers.map(member => {
                                    const isSelected = selectedMembers.find(m => m._id === member._id);
                                    return (
                                        <button
                                            key={member._id}
                                            onClick={() => handleMemberToggle(member)}
                                            className={`w-full p-2 rounded-lg border transition-all duration-200 text-left ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className="avatar">
                                                        <div className="w-8 h-8 rounded-full">
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
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-content rounded-full flex items-center justify-center">
                                                            <Check className="w-2 h-2" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{member.fullName}</h4>
                                                    <p className="text-xs text-base-content/60 truncate">{member.email}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    /* Members List */
                    <div className="space-y-3">
                        {group.members?.map((member) => (
                            <div key={member._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 relative">
                                <div className="avatar online">
                                    <div className="w-10 h-10 rounded-full">
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
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold truncate">{member.fullName}</h4>
                                        {group.createdBy?._id === member._id && (
                                            <span className="badge badge-warning badge-xs">Creator</span>
                                        )}
                                        {group.admins?.some(admin => admin._id === member._id) && (
                                            <span className="badge badge-primary badge-xs">Admin</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-base-content/60 truncate">{member.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-base-300">
                {showAddMembers ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddMembers}
                            disabled={selectedMembers.length === 0 || addMemberMutation.isPending}
                            className="btn btn-primary btn-sm flex-1"
                        >
                            {addMemberMutation.isPending ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>Add Selected ({selectedMembers.length})</>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setShowAddMembers(false);
                                setSelectedMembers([]);
                                setSearchQuery('');
                            }}
                            className="btn btn-ghost btn-sm"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddMembers(true)}
                        className="btn btn-primary btn-sm w-full"
                        disabled={!isAdmin}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Members
                    </button>
                )}
            </div>
        </div>
    );
};

export default MembersSidebar;