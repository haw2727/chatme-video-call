import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { acceptFriendRequest, rejectFriendRequest, getFriendRequests } from '../lib/api'
import { BeakerIcon, MessageCircleIcon, UserCheckIcon, ClockIcon, XIcon } from 'lucide-react'
import NoNotificationsFound from '../components/NoNotificationsFound'
import useAuthUser from '../hooks/useAuthUser'
import { showToast } from '../components/Toast'

function NotificationPage() {
  const { isAuthenticated } = useAuthUser();
  const queryClient = useQueryClient()

  const { data: friendRequests = { incomingRequests: [], acceptedRequests: [] }, isLoading } = useQuery({
    queryKey: ['friendRequest'],
    queryFn: getFriendRequests,
    enabled: isAuthenticated, // Only run when authenticated
    retry: false,                 // stop automatic retries (caused 3 repeated errors)
    refetchOnWindowFocus: false,  // optional: reduce repeated fetching
  })

  const { mutate: acceptRequestMutation, isLoading: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequest'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      showToast.success('Friend request accepted!')
    },
    onError: (error) => {
      showToast.error('Failed to accept friend request')
      console.error('Error accepting friend request:', error)
    }
  })

  const { mutate: rejectRequestMutation, isLoading: isRejecting } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequest'] })
      showToast.info('Friend request rejected')
    },
    onError: (error) => {
      showToast.error('Failed to reject friend request')
      console.error('Error rejecting friend request:', error)
    }
  })

  const incomingRequest = friendRequests?.incomingRequests ?? []
  const acceptedRequest = friendRequests?.acceptedRequests ?? []

  // Don't render anything if not authenticated (should not happen due to route protection)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='container max-w-4xl mx-auto space-y-8'>
        <h1 className='mb-6 text-2xl font-bold tracking-tight sm:text-3xl'>Notifications</h1>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <span className='loading loading-spinner loading-lg'></span>
          </div>
        ) : (
          <>
            {incomingRequest.length > 0 && (
              <section className='space-y-4'>
                <h2 className='flex items-center gap-2 text-xl font-semibold'>
                  <UserCheckIcon className='w-5 h-5 text-primary' />
                  Friend Requests
                  <span className='ml-2 badge badge-primary'>{incomingRequest.length}</span>
                </h2>

                <div className='space-y-3'>
                  {incomingRequest.map((request) => (
                    <div key={request._id} className='flex transition-shadow shadow-sm card bg-base-200 hover:shadow-md'>
                      <div className='p-4 card-body'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='rounded-full avatar size-14 bg-base-300'>
                              <img
                                src={request.from?.profilePic || '/default-avatar.png'}
                                alt={request.from?.fullName}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.from?.fullName || 'User')}&background=random&color=fff`;
                                }}
                              />
                            </div>
                            <div>
                              <h3 className='font-semibold'>{request.from?.fullName}</h3>
                              {request.from?.bio && (
                                <p className='text-sm text-base-content/70 mt-1 line-clamp-1'>{request.from.bio}</p>
                              )}
                              <div className='flex flex-wrap gap-1.5 mt-1'>
                                {request.from?.nativeLanguage && (
                                  <span className='badge badge-outline badge-sm'>Native: {request.from.nativeLanguage}</span>
                                )}
                                {request.from?.learningLanguage && (
                                  <span className='badge badge-outline badge-sm'>Learning: {request.from.learningLanguage}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <button
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={isAccepting || isRejecting}
                              className='btn btn-primary btn-sm'
                            >
                              {isAccepting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                'Accept'
                              )}
                            </button>
                            <button
                              onClick={() => rejectRequestMutation(request._id)}
                              disabled={isAccepting || isRejecting}
                              className='btn btn-outline btn-error btn-sm'
                              title="Reject request"
                            >
                              {isRejecting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <XIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {acceptedRequest.length > 0 && (
              <section className='space-y-4'>
                <h2 className='flex items-center gap-2 text-xl font-semibold'>
                  <BeakerIcon className='w-5 h-5 text-success' />
                  Recent Connections
                  <span className='ml-2 badge badge-success'>{acceptedRequest.length}</span>
                </h2>

                <div className='space-y-3'>
                  {acceptedRequest.map((notification) => (
                    <div key={notification._id} className='flex transition-shadow shadow-sm card bg-base-200 hover:shadow-md'>
                      <div className='p-4 card-body'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='rounded-full avatar size-14 bg-base-300'>
                              <img
                                src={notification.from?.profilePic || '/default-avatar.png'}
                                alt={notification.from?.fullName}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.from?.fullName || 'User')}&background=random&color=fff`;
                                }}
                              />
                            </div>
                            <div className='flex-1'>
                              <h3 className='font-semibold'>{notification.from?.fullName}</h3>
                              <p className='my-1 text-sm'>
                                You accepted {notification.from?.fullName}'s friend request.
                              </p>
                              <p className='flex items-center text-xs opacity-70'>
                                <ClockIcon className='w-4 h-4 mr-1' />
                                {new Date(notification.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className='badge badge-success'>
                              <MessageCircleIcon className='w-4 h-4 mr-1' />
                              New Friend
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequest.length === 0 && acceptedRequest.length === 0 && <NoNotificationsFound />}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationPage