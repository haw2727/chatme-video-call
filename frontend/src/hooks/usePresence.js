import { useState, useEffect, useRef } from 'react';
import { showToast } from '../components/Toast';

export const usePresence = (userId) => {
    const [isOnline, setIsOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

    const connect = () => {
        if (!userId) return;

        try {
            const wsUrl = `ws://localhost:5002/ws?userId=${userId}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('Presence WebSocket connected');
                setIsOnline(true);

                // Send heartbeat every 30 seconds
                heartbeatIntervalRef.current = setInterval(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
                    }
                }, 30000);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'presence_update':
                            if (data.userId !== userId) {
                                // Handle other users' presence updates
                                console.log(`User ${data.userId} is ${data.status}`);
                            }
                            break;
                        case 'user_status':
                            setIsOnline(data.isOnline);
                            setLastSeen(data.lastSeen);
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('Presence WebSocket disconnected');
                setIsOnline(false);

                // Clear heartbeat
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                }

                // Attempt to reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error('Presence WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to connect to presence WebSocket:', error);
        }
    };

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
    };

    const updateStatus = (status) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'status_update',
                status
            }));
        }
    };

    useEffect(() => {
        connect();
        return disconnect;
    }, [userId]);

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updateStatus('away');
            } else {
                updateStatus('online');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return {
        isOnline,
        lastSeen,
        updateStatus,
        connect,
        disconnect
    };
};