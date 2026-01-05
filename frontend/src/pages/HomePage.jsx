import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { getOutgoingFriendRequests, getRecommendedUsers, getUserFriends, sendFriendRequest } from '../lib/api';
import { CheckCircleIcon, MapIcon, UsersIcon, UserPlusIcon, Search, Filter, Grid, List, RefreshCw } from 'lucide-react';
import ModernFriendCard from '../components/ModernFriendCard';
import { Link } from 'react-router-dom';
import NoFriendsFound from '../components/NoFriendsFound';
import { showToast } from '../components/Toast';
import useAuthUser from '../hooks/useAuthUser';
import { useNotifications } from '../hooks/useNotifications';

function HomePage() {
  const { isAuthenticated } = useAuthUser();
  const { totalNotifications } = useNotifications();
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: friendsRaw, isLoading: loadingFriends, refetch: refetchFriends } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
    enabled: isAuthenticated,
  });

  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : (friendsRaw?.data ?? friendsRaw?.friends ?? []);

  const { data: recommendedUsersRaw, isLoading: loadingRecommendedUsers, refetch: refetchRecommended } = useQuery({
    queryKey: ["recommendedFriends"],
    queryFn: getRecommendedUsers,
    enabled: isAuthenticated,
  });

  const recommendedList = Array.isArray(recommendedUsersRaw)
    ? recommendedUsersRaw
    : (recommendedUsersRaw?.data ?? recommendedUsersRaw?.users ?? []);

  const { data: outgoingRequests } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingFriendRequests,
    enabled: isAuthenticated,
    onError: (err) => {
      console.error("Error fetching outgoing friend requests:", err);
    }
  });

  const { mutate: sendRequestMutation, isPending: isSending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedFriends"] });
      showToast.success('Friend request sent successfully!');
    },
    onError: (error) => {
      showToast.error(error?.response?.data?.message || 'Failed to send friend request');
    }
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingRequests && outgoingRequests.length > 0) {
      outgoingRequests.forEach((req) => {
        outgoingIds.add(req.to?._id || req.recipient?._id || req._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingRequests]);

  // Filter recommended users based on search query
  const filteredRecommendedUsers = recommendedList.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query) ||
      user.location?.toLowerCase().includes(query)
    );
  });

  const handleRefresh = () => {
    refetchFriends();
    refetchRecommended();
    showToast.success('Refreshed!');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl h-full flex flex-col">

        {/* Fixed Header Section */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300 mb-6 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome to ChatMe
              </h1>
              <p className="text-base-content/70 mt-1">
                Connect with friends and discover new people
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="btn btn-outline btn-sm"
                disabled={loadingFriends || loadingRecommendedUsers}
              >
                <RefreshCw className={`w-4 h-4 ${(loadingFriends || loadingRecommendedUsers) ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link to="/notifications" className="btn btn-primary btn-sm">
                <UsersIcon className="w-4 h-4" />
                Requests
                {totalNotifications > 0 && (
                  <div className="badge badge-error badge-sm ml-1">
                    {totalNotifications}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Content Area - Flexible Height */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">

          {/* Friends Section - Fixed Header, Scrollable Content */}
          <section className="bg-base-100 rounded-2xl shadow-sm border border-base-300 flex flex-col min-h-0 flex-1">
            {/* Fixed Friends Header */}
            <div className="p-6 pb-4 border-b border-base-300 flex-shrink-0">
              <h2 className="text-xl font-bold">Your Friends ({friends.length})</h2>
            </div>

            {/* Scrollable Friends Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {loadingFriends ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : friends.length === 0 ? (
                <NoFriendsFound />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {friends.map((friend) => (
                    <ModernFriendCard
                      key={friend._id}
                      friend={friend}
                      onVideoCall={(friendId) => {
                        window.location.href = `/call/${friendId}`;
                      }}
                      onVoiceCall={(friendId) => {
                        showToast.info('Voice calls coming soon!');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Discover People Section - Fixed Header, Scrollable Content */}
          <section className="bg-base-100 rounded-2xl shadow-sm border border-base-300 flex flex-col min-h-0 flex-1">
            {/* Fixed Discover Header */}
            <div className="p-6 pb-4 border-b border-base-300 flex-shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">Discover People ({filteredRecommendedUsers.length})</h2>
                  <p className="text-base-content/70 text-sm">
                    Find and connect with new people
                  </p>
                </div>

                {/* View Controls */}
                <div className="flex items-center gap-2">
                  <div className="join">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`btn btn-sm join-item ${viewMode === 'grid' ? 'btn-active' : 'btn-outline'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`btn btn-sm join-item ${viewMode === 'list' ? 'btn-active' : 'btn-outline'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Search by name, email, bio, or location..."
                    className="input input-bordered w-full pl-10 input-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-outline btn-sm ${showFilters ? 'btn-active' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-base-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium text-sm">Sort by</span>
                      </label>
                      <select className="select select-bordered w-full select-sm">
                        <option>Recently joined</option>
                        <option>Name (A-Z)</option>
                        <option>Location</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text font-medium text-sm">Location</span>
                      </label>
                      <select className="select select-bordered w-full select-sm">
                        <option>All locations</option>
                        <option>Same city</option>
                        <option>Same country</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text font-medium text-sm">Status</span>
                      </label>
                      <select className="select select-bordered w-full select-sm">
                        <option>All users</option>
                        <option>Online now</option>
                        <option>Recently active</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Discover Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {loadingRecommendedUsers ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : filteredRecommendedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-base-200 rounded-xl p-6 max-w-md mx-auto">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-base-content/40" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'No matches found' : 'No new people to discover'}
                    </h3>
                    <p className="text-base-content/60 text-sm mb-3">
                      {searchQuery
                        ? 'Try adjusting your search terms or filters'
                        : 'Check back later for new people to connect with'
                      }
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="btn btn-outline btn-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-3"
                }>
                  {filteredRecommendedUsers.map((user) => {
                    const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                    if (viewMode === 'list') {
                      return (
                        <div key={user._id} className="bg-base-200 rounded-lg p-4 hover:bg-base-300 transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                                <img
                                  src={user.profilePic}
                                  alt={user.fullName}
                                  className="object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff`;
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{user.fullName}</h3>
                              <p className="text-sm text-base-content/60 truncate">{user.email}</p>
                              {user.location && (
                                <div className="flex items-center text-xs text-base-content/50">
                                  <MapIcon className="w-3 h-3 mr-1" />
                                  <span className="truncate">{user.location}</span>
                                </div>
                              )}
                            </div>

                            <button
                              className={`btn btn-sm ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                              onClick={() => sendRequestMutation(user._id)}
                              disabled={hasRequestBeenSent || isSending}
                            >
                              {hasRequestBeenSent ? (
                                <>
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Sent
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="w-4 h-4" />
                                  Add
                                </>
                              )}
                            </button>
                          </div>
                          {user.bio && (
                            <p className="text-sm text-base-content/70 mt-2 line-clamp-2 pl-15">{user.bio}</p>
                          )}
                        </div>
                      );
                    }

                    // Grid view - Compact cards
                    return (
                      <div key={user._id} className="bg-base-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 border border-base-300">
                        <div className="flex flex-col items-center text-center">
                          <div className="avatar mb-3">
                            <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                              <img
                                src={user.profilePic}
                                alt={user.fullName}
                                className="object-cover"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff`;
                                }}
                              />
                            </div>
                          </div>

                          <h3 className="font-semibold text-sm mb-1 truncate w-full">{user.fullName}</h3>

                          {user.location && (
                            <div className="flex items-center justify-center text-xs text-base-content/50 mb-2">
                              <MapIcon className="w-3 h-3 mr-1" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}

                          {user.bio && (
                            <p className="text-xs text-base-content/70 mb-3 line-clamp-2">{user.bio}</p>
                          )}

                          <button
                            className={`btn btn-sm w-full ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isSending}
                          >
                            {hasRequestBeenSent ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="w-4 h-4 mr-1" />
                                Add Friend
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;