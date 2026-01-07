import { useQuery } from '@tanstack/react-query';
import { getUserFriends } from '../lib/api';
import useAuthUser from './useAuthUser';

export const useFriendsCount = () => {
    const { isAuthenticated } = useAuthUser();

    const { data: friendsData } = useQuery({
        queryKey: ['userFriends'],
        queryFn: getUserFriends,
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const friends = Array.isArray(friendsData)
        ? friendsData
        : (friendsData?.data ?? friendsData?.friends ?? []);

    return {
        friendsCount: friends.length,
        friends
    };
};