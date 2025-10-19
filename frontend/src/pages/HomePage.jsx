import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { getOutgoingFriendRequests, getRecommendedUsers, getUserFriends, sendFriendRequest } from '../lib/api';
import { CheckCircleIcon, MapIcon, UsersIcon, UserPlusIcon } from 'lucide-react';
import FriendCard  from '../components/FriendCard';
import { Link } from 'react-router-dom';
import NoFriendsFound from '../components/NoFriendsFound';
import { capitalize, getLanguageFlag } from '../utils/languageUtils';

function HomePage() {
  
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  
  const { data: friendsRaw, isLoading: loadingFriends } = useQuery({
    queryKey: ["userFriends"], // CHANGED: Unique key
    queryFn: getUserFriends,
  });
  
  // normalize friends to always be an array
  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : (friendsRaw?.data ?? friendsRaw?.friends ?? []);

  const { data: recommendedUsersRaw, isLoading: loadingRecommendedUsers } = useQuery({
    queryKey: ["recommendedFriends"], // CHANGED: Unique key
    queryFn: getRecommendedUsers,
  });
  
  // Normalize recommendedUsers to always be an array (handles object responses)
  const recommendedList = Array.isArray(recommendedUsersRaw)
    ? recommendedUsersRaw
    : (recommendedUsersRaw?.data ?? recommendedUsersRaw?.users ?? []);
  
  const { data: outgoingRequests } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingFriendRequests,
    onError: (err) => {
      console.error("Error fetching outgoing friend requests:", err);
    }
  });



  const { mutate: sendRequestMutation, isLoading: isSending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] }); // CHANGED: Corrected query key
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingRequests && outgoingRequests.length > 0) {
      outgoingRequests.forEach((req) => {
        // backend friendRequest likely populated as { from, to } - outgoing means `to` is recipient
        outgoingIds.add(req.to?._id || req.recipient?._id || req._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingRequests]); 
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>Your friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>
        
        {loadingFriends ? (
          <div className='flex justify-center py-12'>
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
        
        <section>
          <div className='mb-6 sm:mb-8'>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>Meet new friends</h2>
                <p className='opacity-70'>
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingRecommendedUsers? (
            <div className='flex justify-center py-12'>
              <span className='loading loading-spinner loading-lg' />
            </div>
          ) : recommendedList.length === 0 ? (
            <div className="p-6 text-center card bg-base-200">
              <h3 className="mb-2 text-lg font-semibold">No recommendation available</h3>
              <p className="opacity-70 text-base-content">
                Check back later for new friends
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {recommendedList.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <div key={user._id} className="transition-all duration-300 card bg-base-200 hover:shadow-lg">
                    <div className='p-5 card-body'>
                      <div className='flex items-center gap-3'>
                        <div className='w-16 h-16 rounded-full avatar'>
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className='text-lg font-semibold'>{user.fullName}</h3>
                          {user.location && (
                            <div className='flex items-center mt-1 text-xs opacity-70'>
                              <MapIcon className='w-3 h-3 mr-1' />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                  {/**Language with Flages */}
                      <div className='flex flex-wrap gap-1.5 mb-3'>
                        <span className='text-xs badge badge-secondary'>
                          {getLanguageFlag(user.nativeLanguage)} Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className='text-xs badge badge-secondary'>
                          {getLanguageFlag(user.learningLanguage)} Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button
                        className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isSending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className='w-4 h-4 mr-2' />
                            Request sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="w-4 h-4 mr-2" />
                            Send friend request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;

