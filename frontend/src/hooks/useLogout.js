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
      // Clear all cached data first
      queryClient.clear();
      // Force remove auth data
      queryClient.setQueryData(["authUser"], null);
      // Clear login flag
      localStorage.removeItem('isLoggedIn');

      // Navigate to login page immediately
      navigate('/login', { replace: true });

      // Show success message
      showToast.success('Logged out successfully', { id: 'logout' });
    },
    onError: (error) => {
      console.error('Logout error:', error);

      // Even if logout fails on server, clear local data and redirect
      queryClient.clear();
      queryClient.setQueryData(["authUser"], null);
      localStorage.removeItem('isLoggedIn');

      // Force navigation to login
      navigate('/login', { replace: true });

      // Show info message
      showToast.info('Logged out locally', { id: 'logout' });
    },
    onSettled: () => {
      // Ensure we always navigate to login regardless of success/error
      // This is a safety net in case the above doesn't work
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
    }
  });
};

export default useLogout;