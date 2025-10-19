
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

function useLogout() {
  const queryClient = useQueryClient();

  const { mutate: logoutMutation, isLoading, error } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
  });

  return { logoutMutation, isLoading, error };
}

export default useLogout;