import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFriendRequests } from '../lib/api';
import { useEffect } from 'react';
import { showToast } from '../components/Toast';
import useAuthUser from './useAuthUser';

export const useNotifications = () => {
    const { isAuthenticated } = useAuthUser();
    const queryClient = useQueryClient();

    const { data: friendRequests = { incomingRequests: [], acceptedRequests: [] } } = useQuery({
        queryKey: ['friendRequest'],
        queryFn: getFriendRequests,
        enabled: isAuthenticated,
        refetchInterval: 30000, // Poll every 30 seconds for new notifications
        refetchOnWindowFocus: true,
    });

    const incomingRequests = friendRequests?.incomingRequests ?? [];
    const acceptedRequests = friendRequests?.acceptedRequests ?? [];

    // Show toast notifications for new friend requests
    useEffect(() => {
        const previousRequests = queryClient.getQueryData(['friendRequest'])?.incomingRequests ?? [];

        if (previousRequests.length > 0 && incomingRequests.length > previousRequests.length) {
            const newRequests = incomingRequests.slice(previousRequests.length);
            newRequests.forEach(request => {
                showToast.success(
                    `${request.from?.fullName} sent you a friend request!`,
                    {
                        duration: 5000,
                        id: `friend-request-${request._id}`,
                    }
                );
            });
        }
    }, [incomingRequests, queryClient]);

    // Show toast notifications for accepted requests
    useEffect(() => {
        const previousAccepted = queryClient.getQueryData(['friendRequest'])?.acceptedRequests ?? [];

        if (previousAccepted.length > 0 && acceptedRequests.length > previousAccepted.length) {
            const newAccepted = acceptedRequests.slice(previousAccepted.length);
            newAccepted.forEach(request => {
                showToast.success(
                    `${request.to?.fullName} accepted your friend request!`,
                    {
                        duration: 5000,
                        id: `friend-accepted-${request._id}`,
                    }
                );
            });
        }
    }, [acceptedRequests, queryClient]);

    return {
        incomingRequests,
        acceptedRequests,
        totalNotifications: incomingRequests.length + acceptedRequests.length,
        hasNewNotifications: incomingRequests.length > 0 || acceptedRequests.length > 0,
    };
};