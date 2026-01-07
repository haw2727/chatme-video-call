import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ChatsPage from './pages/ChatsPage.jsx';
import CallPage from './pages/CallPage.jsx';
import NotificationPage from './pages/NotificationPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';
import GroupChatInterface from './pages/GroupChatInterface.jsx';

import { Toaster } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import ModernLayout from "./components/ModernLayout.jsx";
import { useThemeStore } from './store/useThemeStore.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { StreamChatProvider } from './contexts/StreamChatContext.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import useWebSocket from './hooks/useWebSocket.js';
import IncomingCallNotification from './components/IncomingCallNotification.jsx';

function App() {
  const { isLoading, error, isAuthenticated } = useAuthUser();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  // Initialize WebSocket for call notifications
  const { incomingCall, clearIncomingCall, isConnected } = useWebSocket();

  // Make query client available globally for WebSocket
  useEffect(() => {
    window.queryClient = queryClient;

    // Add global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
      // Prevent the error from being logged to console if it's a known issue
      if (event.reason?.message?.includes('message channel closed') ||
        event.reason?.message?.includes('WS failed with code: 4') ||
        event.reason?.message?.includes('websocket frame header')) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      delete window.queryClient;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [queryClient]);

  // Show loading while checking authentication status
  if (isLoading) {
    return <PageLoader />;
  }

  // If there's an error and it's not a 401 (which is expected when not logged in)
  // Also ignore network errors which happen when backend is starting up
  if (error && error.response?.status !== 401 && error.code !== 'ERR_NETWORK') {
    console.error('Authentication error:', error);
  }

  return (
    <ErrorBoundary>
      <StreamChatProvider>
        <div className="h-screen" data-theme={theme}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <ModernLayout showSidebar={true}>
                    <HomePage />
                  </ModernLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!isAuthenticated ? <LogInPage /> : <Navigate to="/" />} />
            <Route path="/chats" element={
              isAuthenticated ? (
                <ModernLayout showSidebar={true}>
                  <ChatsPage />
                </ModernLayout>
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/chat/:id" element={
              isAuthenticated ? (
                <ModernLayout showSidebar={false}>
                  <ChatPage />
                </ModernLayout>
              ) : (
                <Navigate to="/login" />
              )
            } />

            <Route path="/call/:id" element={
              isAuthenticated ? (
                <CallPage />
              ) : (
                <Navigate to="/login" />
              )
            } />

            <Route
              path="/groups"
              element={isAuthenticated ? (
                <ModernLayout showSidebar={true}>
                  <GroupChatPage />
                </ModernLayout>
              ) : (
                <Navigate to="/login" />
              )} />

            <Route
              path="/groups/:groupId"
              element={isAuthenticated ? (
                <GroupChatInterface />
              ) : (
                <Navigate to="/login" />
              )} />
            <Route
              path="/notifications"
              element={isAuthenticated ? (
                <ModernLayout showSidebar={true}>
                  <NotificationPage />
                </ModernLayout>
              ) : (
                <Navigate to="/login" />
              )} />
            <Route
              path="/settings"
              element={isAuthenticated ? (
                <ModernLayout showSidebar={true}>
                  <SettingsPage />
                </ModernLayout>
              ) : (
                <Navigate to="/login" />
              )} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Incoming Call Notification */}
          {isAuthenticated && incomingCall && (
            <IncomingCallNotification
              incomingCall={incomingCall}
              onClear={clearIncomingCall}
            />
          )}

          <Toaster />
        </div>
      </StreamChatProvider>
    </ErrorBoundary>
  );
}

export default App;