import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../lib/api';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log('[Logout] Starting logout process...');

      // Clear all cached data
      queryClient.clear();
      queryClient.setQueryData(["authUser"], null);

      // Clear local storage
      localStorage.removeItem('isLoggedIn');
      localStorage.clear(); // Clear everything

      // Clear session storage
      sessionStorage.clear();

      // Clear cookies (client-side accessible ones)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      console.log('[Logout] Cleared all data');

      // Show success message
      showToast.success('Logged out successfully', { id: 'logout' });

      // Navigate to login page
      navigate('/login', { replace: true });

      // Force reload after a short delay to ensure clean state
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    },
    onError: (error) => {
      console.error('[Logout] Error:', error);

      // Even if logout fails on server, clear local data
      queryClient.clear();
      queryClient.setQueryData(["authUser"], null);
      localStorage.clear();
      sessionStorage.clear();

      // Show info message
      showToast.info('Logged out locally', { id: 'logout' });

      // Force navigation to login
      window.location.href = '/login';
    }
  });
};

export default useLogout;