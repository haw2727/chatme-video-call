import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { acceptFriendRequest, getFriendRequests } from '../lib/api'
import { BeakerIcon, MessageCircleIcon, UserCheckIcon, ClockIcon } from 'lucide-react'
import NoNotificationsFound from '../components/NoNotificationsFound'
import useAuthUser from '../hooks/useAuthUser'

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


  const { mutate: acceptRequestMutation, isLoading: isMutating } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequest'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
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
                              <img src={request.from?.profilePic} alt={request.from?.fullName} />
                            </div>
                            <div>
                              <h3 className='font-semibold'>{request.from?.fullName}</h3>
                              <div className='flex flex-wrap gap-1.5 mt-1'>
                                <span className='badge badge-outline badge-sm'>Native: {request.from?.nativeLanguage}</span>
                                <span className='badge badge-outline badge-sm'>Learning: {request.from?.learningLanguage}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => acceptRequestMutation(request._id)} disabled={isMutating} className=' btn btn-primary btn-sm'>
                            Accept
                          </button>
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
                  <BeakerIcon className='w-5 h-5 text-primary' />
                  New Connections
                  <span className='ml-2 badge badge-primary'>{acceptedRequest.length}</span>
                </h2>

                <div className='space-y-3'>
                  {acceptedRequest.map((notification) => (
                    <div key={notification._id} className='flex transition-shadow shadow-sm card bg-base-200 hover:shadow-md'>
                      <div className='p-4 card-body'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='rounded-full avatar size-14 bg-base-300'>
                              <img src={notification.to?.profilePic} alt={notification.to?.fullName} />
                            </div>
                            <div className='flex-1'>
                              <h3 className='font-semibold'>{notification.to?.fullName}</h3>
                              <p className='my-1 text-sm'>
                                {notification.to?.fullName} accepted your friend request.
                              </p>
                              <p className='flex items-center text-xs opacity-70'>
                                <ClockIcon className='w-4 h-4 mr-1' />
                                Recently
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