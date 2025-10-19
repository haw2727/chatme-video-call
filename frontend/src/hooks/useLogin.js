
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../lib/api';

function useLogin() {
  const queryClient = useQueryClient();
  const { mutate: loginMutation, isLoading, error } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authUser'] }),
  });

  return { loginMutation, isLoading, error };
}

export default useLogin;