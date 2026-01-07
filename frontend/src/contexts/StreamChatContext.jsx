import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const StreamChatContext = createContext();

export const useStreamChat = () => {
    const context = useContext(StreamChatContext);
    if (!context) {
        throw new Error('useStreamChat must be used within a StreamChatProvider');
    }
    return context;
};

export const StreamChatProvider = ({ children }) => {
    const { authUser, isAuthenticated } = useAuthUser();
    const [chatClient, setChatClient] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Get token with better error handling
    const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
        queryKey: ['streamToken'],
        queryFn: () => getStreamToken(),
        enabled: isAuthenticated && !!authUser,
        retry: 2,
        retryDelay: 1000,
    });

    useEffect(() => {
        let cancelled = false;

        const connectToStream = async () => {
            // If not authenticated, disconnect and cleanup
            if (!isAuthenticated || !authUser) {
                console.log('[StreamChat] Not authenticated, disconnecting...');
                if (chatClient) {
                    try {
                        await chatClient.disconnectUser();
                        console.log('[StreamChat] Disconnected successfully');
                    } catch (error) {
                        console.error('[StreamChat] Disconnect error:', error);
                    }
                }
                setIsConnected(false);
                setIsConnecting(false);
                setChatClient(null);
                return;
            }

            if (tokenLoading) {
                return;
            }

            if (tokenError) {
                console.error('[StreamChat] Token error:', tokenError);
                setIsConnected(false);
                setIsConnecting(false);
                return;
            }

            if (!tokenData) {
                console.log('[StreamChat] No token data yet, waiting...');
                return;
            }

            if (isConnecting || isConnected) {
                return; // Already connecting or connected
            }

            setIsConnecting(true);

            try {
                const token = tokenData?.token ?? tokenData;
                if (!token) {
                    throw new Error('No valid token received');
                }

                if (!STREAM_API_KEY) {
                    throw new Error('VITE_STREAM_API_KEY not found in environment');
                }

                console.log('[StreamChat] Connecting...', {
                    userId: authUser._id,
                    apiKey: STREAM_API_KEY,
                    hasToken: !!token
                });

                // Create client
                const client = StreamChat.getInstance(STREAM_API_KEY);

                // Disconnect any existing connection
                if (client.user) {
                    await client.disconnectUser();
                }

                // Connect user
                await client.connectUser(
                    {
                        id: authUser._id,
                        name: authUser.fullName,
                        image: authUser.profilePic || '',
                    },
                    token
                );

                if (!cancelled) {
                    setChatClient(client);
                    setIsConnected(true);
                    console.log('[StreamChat] Connected successfully');
                }
            } catch (error) {
                console.error('[StreamChat] Connection error:', error);
                if (!cancelled) {
                    setChatClient(null);
                    setIsConnected(false);
                }
            } finally {
                if (!cancelled) {
                    setIsConnecting(false);
                }
            }
        };

        connectToStream();

        return () => {
            cancelled = true;
        };
    }, [authUser?._id, tokenData, isAuthenticated, tokenLoading, tokenError]);

    // Cleanup on unmount or logout
    useEffect(() => {
        return () => {
            if (chatClient) {
                chatClient.disconnectUser().catch(console.error);
            }
        };
    }, [chatClient]);

    const value = {
        chatClient,
        isConnecting,
        isConnected,
        tokenError,
        reconnect: () => {
            setIsConnected(false);
            setIsConnecting(false);
            setChatClient(null);
        }
    };

    return (
        <StreamChatContext.Provider value={value}>
            {children}
        </StreamChatContext.Provider>
    );
};