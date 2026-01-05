import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CallPage from './pages/CallPage.jsx';
import NotificationPage from './pages/NotificationPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';

import { Toaster } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import ModernLayout from "./components/ModernLayout.jsx";
import { useThemeStore } from './store/useThemeStore.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  //tanstack query client
  const { isLoading, authUser, error, isAuthenticated } = useAuthUser();
  const { theme } = useThemeStore();

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
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;