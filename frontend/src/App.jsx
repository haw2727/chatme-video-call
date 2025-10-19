import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CallPage from './pages/CallPage.jsx';
import NotificationPage from './pages/NotificationPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

import { Toaster } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import  Layout   from "./components/Layout.jsx";
import { useThemeStore } from './store/useThemeStore.js';

function App() {
    //tanstack query client
    const {isLoading, authUser, error} = useAuthUser();
    const {theme} = useThemeStore();

    const isAuthenticated = Boolean(authUser);
    const isOnboarded = authUser?.isOnboarded;

    console.log(error);

    if (isLoading) {
      // while we don't know the auth status, render a loading placeholder to avoid immediate redirects
      return <PageLoader />;
    }
  return (
  <div className="h-screen "data-theme={theme}>
     {/*  <button className="btn btn-primary" onClick={() => toast.success("Toaster created!")}>create a toaster</button> */}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout  showSidebar={true}>
                <HomePage />
              </Layout>
            ) :  (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
           
          }
      />
        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />
        <Route path="/login" 
        element={
          !isAuthenticated ? <LogInPage /> : <Navigate to={isOnboarded ? "/":"/onboarding"} />
          } 
        />
        <Route path="/chat/:id" element={
          isAuthenticated && isOnboarded ? (
            <Layout showSidebar={false} >
              <ChatPage />
            </Layout>
          ) : (
            <Navigate to={isAuthenticated ? "/login" : "/onboarding"} />
          )
        } 
      />
        
        <Route path="/call/:id" element={
          isAuthenticated && isOnboarded ? (
            <CallPage />
          ) : (
            <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
          )
        } />
        <Route 
        path="/notifications" 
            element={isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true} >
                 <NotificationPage/>
              </Layout>
            ) : (
              <Navigate to={isAuthenticated ? "/login" : "/onboarding"} />
            ) } />
        <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? (<OnboardingPage />
          ) :( 
          <Navigate to="/"/>)) :(<Navigate to="/login" />
            
          )} />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;