import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserFriends, initiateCall } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import {
    Phone,
    Video,
    Search,
    Users,
    ArrowLeft,
    UserCheck,
    Clock,
    PhoneCall
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { showToast } from '../components/Toast';

const CallSelectionPage = () => {
    const { isAuthenticated } = useAuthUser();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [callType, setCallType] = useState('video'); // 'video' or 'voice'

    const { data: friendsRaw, isLoading: loadingFriends } = useQuery({
        queryKey: ["userFriends"],
        queryFn: getUserFriends,
        enabled: isAuthenticated,
    });

    const friends = Array.isArray(friendsRaw)
        ? friendsRaw
        : (friendsRaw?.data ?? friendsRaw?.friends ?? []);

    // Handle presets from URL (when coming from chat)
    useEffect(() => {
        const preset = searchParams.get('preset');
        const type = searchParams.get('type');

        if (type) {
            setCallType(type);
        }

        if (preset && friends.length > 0) {
            const presetFriend = friends.find(f => f._id === preset);
            if (presetFriend) {
                setSelectedFriends([presetFriend]);
            }
        }
    }, [searchParams, friends]);

    // Filter friends based on search query
    const filteredFriends = friends.filter(friend => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            friend.fullName?.toLowerCase().includes(query) ||
            friend.email?.toLowerCase().includes(query)
        );
    });

    const handleFriendToggle = (friend) => {
        setSelectedFriends(prev => {
            const isSelected = prev.find(f => f._id === friend._id);
            if (isSelected) {
                return prev.filter(f => f._id !== friend._id);
            } else {
                return [...prev, friend];
            }
        });
    };

    const handleStartCall = async () => {
        if (selectedFriends.length === 0) {
            showToast.error('Please select at least one friend to call');
            return;
        }

        try {
            // Get friend IDs
            const friendIds = selectedFriends.map(f => f._id);

            // Initiate call through backend
            const response = await initiateCall(friendIds, callType);

            if (response.success) {
                showToast.success(`${callType === 'video' ? 'Video' : 'Voice'} call invitation sent!`);

                // Navigate to call page
                navigate(`/call/${response.callId}?type=${callType}&initiated=true`);
            }
        } catch (error) {
            console.error('Error starting call:', error);
            showToast.error('Failed to start call. Please try again.');
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
            <div className="container mx-auto px-4 py-6 max-w-4xl h-full flex flex-col">

                {/* Header */}
                <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300 mb-6 flex-shrink-0">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/" className="btn btn-ghost btn-circle">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Start a Call</h1>
                            <p className="text-base-content/70">Select friends to call</p>
                        </div>
                    </div>

                    {/* Call Type Selection */}
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => setCallType('video')}
                            className={`btn ${callType === 'video' ? 'btn-primary' : 'btn-outline'} flex-1`}
                        >
                            <Video className="w-5 h-5 mr-2" />
                            Video Call
                        </button>
                        <button
                            onClick={() => setCallType('voice')}
                            className={`btn ${callType === 'voice' ? 'btn-primary' : 'btn-outline'} flex-1`}
                        >
                            <Phone className="w-5 h-5 mr-2" />
                            Voice Call
                        </button>
                    </div>

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
                </div>

                {/* Selected Friends */}
                {selectedFriends.length > 0 && (
                    <div className="bg-base-100 rounded-2xl p-4 shadow-sm border border-base-300 mb-6 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <UserCheck className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Selected ({selectedFriends.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedFriends.map(friend => (
                                <div key={friend._id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    <img
                                        src={friend.profilePic}
                                        alt={friend.fullName}
                                        className="w-6 h-6 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName)}&background=random&color=fff`;
                                        }}
                                    />
                                    <span className="text-sm font-medium">{friend.fullName}</span>
                                    <button
                                        onClick={() => handleFriendToggle(friend)}
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
                <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 flex flex-col flex-1 min-h-0">
                    <div className="p-6 pb-4 border-b border-base-300 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Your Friends ({filteredFriends.length})</h2>
                            {selectedFriends.length > 0 && (
                                <button
                                    onClick={handleStartCall}
                                    className="btn btn-primary"
                                >
                                    <PhoneCall className="w-5 h-5 mr-2" />
                                    Start {callType === 'video' ? 'Video' : 'Voice'} Call
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                        {loadingFriends ? (
                            <div className="flex justify-center py-12">
                                <span className="loading loading-spinner loading-lg" />
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 mx-auto mb-4 text-base-content/40" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {searchQuery ? 'No friends found' : 'No friends yet'}
                                </h3>
                                <p className="text-base-content/60 mb-4">
                                    {searchQuery
                                        ? 'Try adjusting your search terms'
                                        : 'Add some friends to start calling'
                                    }
                                </p>
                                {!searchQuery && (
                                    <Link to="/" className="btn btn-primary">
                                        Find Friends
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredFriends.map(friend => {
                                    const isSelected = selectedFriends.find(f => f._id === friend._id);

                                    return (
                                        <div
                                            key={friend._id}
                                            onClick={() => handleFriendToggle(friend)}
                                            className={`
                        p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="avatar online">
                                                        <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
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
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center">
                                                            ✓
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg truncate">{friend.fullName}</h3>
                                                    <p className="text-sm text-base-content/60 truncate">{friend.email}</p>
                                                    {friend.location && (
                                                        <p className="text-xs text-base-content/50 truncate">{friend.location}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-xs text-success">
                                                        <div className="w-2 h-2 bg-success rounded-full"></div>
                                                        Online
                                                    </div>
                                                    <Clock className="w-4 h-4 text-base-content/40" />
                                                </div>
                                            </div>

                                            {friend.bio && (
                                                <p className="text-sm text-base-content/70 mt-3 line-clamp-2">
                                                    {friend.bio}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallSelectionPage;