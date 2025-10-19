import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '../lib/api.js';

function useAuthUser() {
      const authUser = useQuery({
      queryKey: ["authUser"],
      queryFn: getAuthUser,
      retry: false, // to prevent automatic retries on failure
      
    });

    return {isLoading:authUser.isLoading, authUser:authUser.data?.user, error:authUser.error};
};

export default useAuthUser;