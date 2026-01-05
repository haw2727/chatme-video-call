import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Video,
    Phone,
    Settings,
    UserPlus,
    Crown,
    MessageSquare
} from 'lucide-react';
import { showToast } from '../components/Toast';
import useAuthUser from '../hooks/useAuthUser';

const GroupChatPage = () => {
    const { authUser } = useAuthUser();
    const [groups, setGroups] = useState([]);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');

    // Mock data for demonstration
    useEffect(() => {
        setGroups([
            {
                id: '1',
                name: 'Study Group',
                description: 'Daily study sessions',
                members: 5,
                avatar: 'https://avatar.iran.liara.run/public/1.png',
                isAdmin: true,
                lastMessage: 'Hey everyone, ready for today\'s session?',
                lastMessageTime: '2 min ago'
            },
            {
                id: '2',
                name: 'Gaming Squad',
                description: 'Let\'s play together!',
                members: 8,
                avatar: 'https://avatar.iran.liara.run/public/2.png',
                isAdmin: false,
                lastMessage: 'Anyone up for a game tonight?',
                lastMessageTime: '1 hour ago'
            }
        ]);
    }, []);

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) {
            showToast.error('Group name is required');
            return;
        }

        const newGroup = {
            id: Date.now().toString(),
            name: newGroupName,
            description: newGroupDescription,
            members: 1,
            avatar: `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}.png`,
            isAdmin: true,
            lastMessage: 'Group created',
            lastMessageTime: 'now'
        };

        setGroups(prev => [newGroup, ...prev]);
        setNewGroupName('');
        setNewGroupDescription('');
        setShowCreateGroup(false);
        showToast.success('Group created successfully!');
    };

    const handleJoinVideoCall = (groupName) => {
        showToast.success(`Starting video call in ${groupName}`);
        // TODO: Implement group video call
    };

    const handleJoinVoiceCall = (groupName) => {
        showToast.success(`Starting voice call in ${groupName}`);
        // TODO: Implement group voice call
    };

    return (
        <div className="min-h-screen bg-base-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
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

                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <div key={group.id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="card-body">
                                {/* Group Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full">
                                            <img src={group.avatar} alt={group.name} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{group.name}</h3>
                                            {group.isAdmin && (
                                                <Crown className="w-4 h-4 text-warning" title="Admin" />
                                            )}
                                        </div>
                                        <p className="text-sm opacity-70">{group.members} members</p>
                                    </div>
                                </div>

                                {/* Group Description */}
                                {group.description && (
                                    <p className="text-sm opacity-80 mb-3">{group.description}</p>
                                )}

                                {/* Last Message */}
                                <div className="bg-base-300 rounded-lg p-3 mb-4">
                                    <p className="text-sm">{group.lastMessage}</p>
                                    <p className="text-xs opacity-60 mt-1">{group.lastMessageTime}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm flex-1"
                                        onClick={() => showToast.info(`Opening chat with ${group.name}`)}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        Chat
                                    </button>

                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleJoinVideoCall(group.name)}
                                        title="Video Call"
                                    >
                                        <Video className="w-4 h-4" />
                                    </button>

                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleJoinVoiceCall(group.name)}
                                        title="Voice Call"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </button>

                                    {group.isAdmin && (
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
                    {groups.length === 0 && (
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
                </div>

                {/* Create Group Modal */}
                {showCreateGroup && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg mb-4">Create New Group</h3>

                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Group Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter group name"
                                        className="input input-bordered"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Description (Optional)</span>
                                    </label>
                                    <textarea
                                        placeholder="What's this group about?"
                                        className="textarea textarea-bordered"
                                        value={newGroupDescription}
                                        onChange={(e) => setNewGroupDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-action">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowCreateGroup(false);
                                        setNewGroupName('');
                                        setNewGroupDescription('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateGroup}
                                >
                                    Create Group
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupChatPage;