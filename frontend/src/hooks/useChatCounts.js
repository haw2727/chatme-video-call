import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '../lib/api';
import { useEffect, useState } from 'react';
import useAuthUser from './useAuthUser';
import { useStreamChat } from '../contexts/StreamChatContext';

export const useChatCounts = () => {
    const { isAuthenticated, authUser } = useAuthUser();
    const { chatClient, isConnected } = useStreamChat();
    const [chatCount, setChatCount] = useState(0);
    const [groupCount, setGroupCount] = useState(0);

    // Get groups count
    const { data: groupsData } = useQuery({
        queryKey: ['userGroups'],
        queryFn: getUserGroups,
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Get chats count from Stream
    useEffect(() => {
        let cancelled = false;

        const getChatCount = async () => {
            if (!authUser || !chatClient || !isConnected || !isAuthenticated) {
                setChatCount(0);
                return;
            }

            try {
                // Query for channels where user is a member
                const filter = {
                    type: 'messaging',
                    members: { $in: [authUser._id] }
                };

                const sort = { last_message_at: -1 };
                const options = { limit: 100 };

                const channels = await chatClient.queryChannels(filter, sort, options);

                if (!cancelled) {
                    // Filter out channels that are just user talking to themselves
                    const validChats = channels.filter(channel => {
                        const members = Object.keys(channel.state.members);
                        return members.length > 1; // More than just the current user
                    });

                    setChatCount(validChats.length);
                }
            } catch (error) {
                console.error('Error getting chat count:', error);
                if (!cancelled) {
                    setChatCount(0);
                }
            }
        };

        if (chatClient && isConnected) {
            getChatCount();
        } else {
            setChatCount(0);
        }

        return () => {
            cancelled = true;
        };
    }, [authUser, chatClient, isConnected, isAuthenticated]);

    // Update group count when groups data changes
    useEffect(() => {
        if (groupsData) {
            const groups = Array.isArray(groupsData)
                ? groupsData
                : (groupsData?.groups ?? groupsData?.data ?? []);
            setGroupCount(groups.length);
        } else {
            setGroupCount(0);
        }
    }, [groupsData]);

    return {
        chatCount,
        groupCount,
        totalCount: chatCount + groupCount,
    };
};