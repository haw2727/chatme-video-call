import { useEffect, useRef, useState } from 'react';
import useAuthUser from './useAuthUser';
import { showToast } from '../components/Toast';

const useWebSocket = () => {
    const { authUser, isAuthenticated } = useAuthUser();
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

    const connect = () => {
        if (!isAuthenticated || !authUser) return;

        try {
            // Get JWT token from cookies for WebSocket authentication
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('jwt='))
                ?.split('=')[1];

            if (!token) {
                console.warn('No JWT token found for WebSocket connection');
                return;
            }

            const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?token=${token}`;

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);

                // Start heartbeat
                heartbeatIntervalRef.current = setInterval(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
                    }
                }, 30000); // Send heartbeat every 30 seconds
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIncomingCall(null);

                // Clear heartbeat
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }

                // Attempt to reconnect after 3 seconds if not a normal closure
                if (event.code !== 1000 && isAuthenticated) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Attempting to reconnect WebSocket...');
                        connect();
                    }, 3000);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
        }
    };

    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'User logout');
            wsRef.current = null;
        }

        setIsConnected(false);
        setIncomingCall(null);
    };

    const handleWebSocketMessage = (data) => {
        console.log('WebSocket message received:', data);

        switch (data.type) {
            case 'connected':
                console.log('WebSocket authenticated successfully');
                break;

            case 'call_invitation':
                console.log('Incoming call invitation:', data);
                setIncomingCall({
                    callId: data.callId,
                    caller: data.caller,
                    callType: data.callType,
                    participants: data.participants,
                    createdAt: new Date(data.createdAt)
                });

                // Show notification
                showToast.info(`Incoming ${data.callType} call from ${data.caller.name}`, {
                    duration: 10000,
                    id: `call-${data.callId}`
                });
                break;

            case 'call_response':
                console.log('Call response received:', data);
                const responseMessage = data.response === 'accept'
                    ? `${data.participant.name} accepted the call`
                    : `${data.participant.name} declined the call`;

                showToast.info(responseMessage);
                break;

            case 'call_ended':
                console.log('Call ended:', data);
                setIncomingCall(null);
                showToast.info(`Call ended by ${data.endedBy.name}`);
                break;

            case 'pong':
                // Heartbeat response
                break;

            case 'error':
                console.error('WebSocket error message:', data.message);
                showToast.error(data.message);
                break;

            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    };

    const sendMessage = (message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    };

    const clearIncomingCall = () => {
        setIncomingCall(null);
    };

    // Connect when authenticated, disconnect when not
    useEffect(() => {
        if (isAuthenticated && authUser) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [isAuthenticated, authUser]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    return {
        isConnected,
        incomingCall,
        sendMessage,
        clearIncomingCall,
        connect,
        disconnect
    };
};

export default useWebSocket;