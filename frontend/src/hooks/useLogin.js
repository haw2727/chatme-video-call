import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../lib/api';
import { ErrorHandler } from '../lib/errorHandler';
import { showToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Clear any existing auth data and set new data
      queryClient.setQueryData(['authUser'], data);
      queryClient.invalidateQueries({ queryKey: ['authUser'] });

      // Navigate to home page
      navigate('/', { replace: true });

      // Show success message
      showToast.success('Welcome back!');
    },
    onError: (error) => {
      ErrorHandler.showToast(error, 'login');
    }
  });
};