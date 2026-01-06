import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserFriends, createGroup } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import { X, Search, Users, User, Plus, Check, Crown, Image } from 'lucide-react';
import { showToast } from './Toast';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { isAuthenticated, authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1); // 1: Group Info, 2: Add Members
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Group info state
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupAvatar, setGroupAvatar] = useState('');

    const { data: friendsRaw, isLoading: loadingFriends } = useQuery({
        queryKey: ["userFriends"],
        queryFn: getUserFriends,
        enabled: isAuthenticated && isOpen && currentStep === 2,
    });

    const friends = Array.isArray(friendsRaw)
        ? friendsRaw
        : (friendsRaw?.data ?? friendsRaw?.friends ?? []);

    // Create group mutation
    const createGroupMutation = useMutation({
        mutationFn: createGroup,
        onSuccess: (data) => {
            showToast.success(`Group "${data.group.name}" created successfully!`);
            queryClient.invalidateQueries(['userGroups']);
            handleClose();
        },
        onError: (error) => {
            showToast.error(error.response?.data?.message || 'Failed to create group');
        }
    });

    // Filter friends based on search query
    const filteredFriends = friends.filter(friend => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            friend.fullName?.toLowerCase().includes(query) ||
            friend.email?.toLowerCase().includes(query)
        );
    });

    const handleClose = () => {
        setCurrentStep(1);
        setGroupName('');
        setGroupDescription('');
        setGroupAvatar('');
        setSelectedMembers([]);
        setSearchQuery('');
        onClose();
    };

    const handleMemberToggle = (friend) => {
        setSelectedMembers(prev => {
            const isSelected = prev.find(m => m._id === friend._id);
            if (isSelected) {
                return prev.filter(m => m._id !== friend._id);
            } else {
                return [...prev, friend];
            }
        });
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!groupName.trim()) {
                showToast.error('Group name is required');
                return;
            }
            setCurrentStep(2);
        }
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            showToast.error('Group name is required');
            return;
        }

        const groupData = {
            name: groupName.trim(),
            description: groupDescription.trim(),
            memberIds: selectedMembers.map(member => member._id)
        };

        createGroupMutation.mutate(groupData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Create Group</h2>
                            <p className="text-sm text-base-content/60">
                                Step {currentStep} of 2 - {currentStep === 1 ? 'Group Info' : 'Add Members'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-circle btn-sm"
                        disabled={createGroupMutation.isPending}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-2">
                    <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-base-300'}`} />
                        <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-base-300'}`} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 ? (
                        /* Step 1: Group Info */
                        <div className="space-y-6">
                            {/* Group Avatar */}
                            <div className="text-center">
                                <div className="avatar mb-4">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                        {groupAvatar ? (
                                            <img src={groupAvatar} alt="Group" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <Users className="w-12 h-12 text-white" />
                                        )}
                                    </div>
                                </div>
                                <button className="btn btn-outline btn-sm">
                                    <Image className="w-4 h-4 mr-2" />
                                    Add Photo
                                </button>
                            </div>

                            {/* Group Name */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Group Name *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter group name..."
                                    className="input input-bordered w-full"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    maxLength={50}
                                />
                                <label className="label">
                                    <span className="label-text-alt text-base-content/60">
                                        {groupName.length}/50 characters
                                    </span>
                                </label>
                            </div>

                            {/* Group Description */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Description (Optional)</span>
                                </label>
                                <textarea
                                    placeholder="What's this group about?"
                                    className="textarea textarea-bordered w-full h-24 resize-none"
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    maxLength={200}
                                />
                                <label className="label">
                                    <span className="label-text-alt text-base-content/60">
                                        {groupDescription.length}/200 characters
                                    </span>
                                </label>
                            </div>

                            {/* Group Features Info */}
                            <div className="bg-base-200 rounded-lg p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-primary" />
                                    Group Features
                                </h4>
                                <ul className="text-sm text-base-content/70 space-y-1">
                                    <li>• You'll be the group admin</li>
                                    <li>• Add up to 100 members</li>
                                    <li>• Group chat with all members</li>
                                    <li>• Voice and video calls</li>
                                    <li>• File and media sharing</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Add Members */
                        <div className="space-y-4">
                            {/* Search */}
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

                            {/* Selected Members */}
                            {selectedMembers.length > 0 && (
                                <div className="bg-base-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Check className="w-4 h-4 text-success" />
                                        <span className="font-semibold text-sm">Selected ({selectedMembers.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMembers.map(member => (
                                            <div key={member._id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                                <img
                                                    src={member.profilePic}
                                                    alt={member.fullName}
                                                    className="w-5 h-5 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random&color=fff`;
                                                    }}
                                                />
                                                <span className="font-medium">{member.fullName}</span>
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

                            {/* Friends List */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {loadingFriends ? (
                                    <div className="flex justify-center py-8">
                                        <span className="loading loading-spinner loading-lg" />
                                    </div>
                                ) : filteredFriends.length === 0 ? (
                                    <div className="text-center py-8">
                                        <User className="w-12 h-12 mx-auto mb-3 text-base-content/40" />
                                        <p className="text-base-content/60">
                                            {searchQuery ? 'No friends found' : 'No friends to add'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredFriends.map(friend => {
                                        const isSelected = selectedMembers.find(m => m._id === friend._id);
                                        return (
                                            <button
                                                key={friend._id}
                                                onClick={() => handleMemberToggle(friend)}
                                                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="avatar online">
                                                            <div className="w-10 h-10 rounded-full">
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
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-content rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold truncate">{friend.fullName}</h3>
                                                        <p className="text-sm text-base-content/60 truncate">{friend.email}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-base-300 bg-base-200/50">
                    <div className="flex items-center justify-between">
                        {currentStep === 1 ? (
                            <>
                                <button
                                    onClick={handleClose}
                                    className="btn btn-ghost"
                                    disabled={createGroupMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    className="btn btn-primary"
                                    disabled={!groupName.trim()}
                                >
                                    Next: Add Members
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="btn btn-ghost"
                                    disabled={createGroupMutation.isPending}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCreateGroup}
                                    className="btn btn-primary"
                                    disabled={createGroupMutation.isPending}
                                >
                                    {createGroupMutation.isPending ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Group
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {currentStep === 2 && (
                        <p className="text-xs text-base-content/60 mt-2 text-center">
                            {selectedMembers.length} member(s) selected • You can add more members later
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;