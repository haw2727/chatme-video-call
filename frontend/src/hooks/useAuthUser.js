import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthUser } from '../lib/api.js';
import { useEffect } from 'react';

function useAuthUser() {
  const queryClient = useQueryClient();

  // Check if we should enable the auth query
  const shouldCheckAuth = () => {
    const hasAuthCookie = document.cookie.includes('jwt=');
    const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true';
    return hasAuthCookie || hasLoginFlag;
  };

  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const result = await getAuthUser();
        return result;
      } catch (error) {
        // Only throw for non-auth errors
        if (error.message?.includes('401') || error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.response?.status === 401) {
        return false;
      }
      // Retry network errors up to 3 times
      if (error?.code === 'ERR_NETWORK' || error?.code === 'ERR_CONNECTION_REFUSED') {
        return failureCount < 3;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Only enable the query if there are indicators that user might be logged in
    enabled: shouldCheckAuth(),
    onError: (error) => {
      // Clear auth data on auth errors
      if (error?.message?.includes('401') || error?.response?.status === 401) {
        queryClient.setQueryData(["authUser"], null);
        localStorage.removeItem('isLoggedIn');
      }
    }
  });

  // Listen for storage changes to re-enable query when user logs in
  useEffect(() => {
    const handleStorageChange = () => {
      if (shouldCheckAuth() && !authUser.isEnabled) {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authUser.isEnabled, queryClient]);

  return {
    isLoading: authUser.isLoading,
    authUser: authUser.data?.user || null,
    error: authUser.error,
    // Check if user is authenticated
    isAuthenticated: !!(authUser.data?.user && authUser.data?.success)
  };
};

export default useAuthUser;