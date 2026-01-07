// Global error handler utility
export const setupGlobalErrorHandlers = () => {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.warn('Unhandled promise rejection:', event.reason);

        // Suppress known browser extension errors and WebSocket errors
        if (event.reason?.message?.includes('message channel closed') ||
            event.reason?.message?.includes('Extension context invalidated') ||
            event.reason?.message?.includes('ERR_NETWORK_CHANGED') ||
            event.reason?.message?.includes('WS failed with code: 4') ||
            event.reason?.message?.includes('websocket frame header')) {
            event.preventDefault();
            return;
        }
    });

    // Handle general errors
    window.addEventListener('error', (event) => {
        console.warn('Global error:', event.error);

        // Suppress known network errors and WebSocket errors
        if (event.error?.message?.includes('ERR_NETWORK_CHANGED') ||
            event.error?.message?.includes('net::ERR_NETWORK_CHANGED') ||
            event.error?.message?.includes('WS failed with code: 4') ||
            event.error?.message?.includes('websocket frame header')) {
            event.preventDefault();
            return;
        }
    });
};

// Clean up error handlers
export const cleanupGlobalErrorHandlers = () => {
    // Remove event listeners if needed
    // This is mainly for cleanup in tests or when unmounting the app
};