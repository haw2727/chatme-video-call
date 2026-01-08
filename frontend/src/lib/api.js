import { axiosInstance, silentAxiosInstance } from './axios.js';

// Signup API call
export const signup = async (signupData) => {
  const response = await axiosInstance.post('/auth/signup', signupData);
  // Set a flag that user is logged in
  localStorage.setItem('isLoggedIn', 'true');
  return response.data;
};

// Login API call
export const login = async (loginData) => {
  const response = await axiosInstance.post('/auth/login', loginData);
  // Set a flag that user is logged in
  localStorage.setItem('isLoggedIn', 'true');
  return response.data;
};

// Logout API Call
export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  // Clear the login flag
  localStorage.removeItem('isLoggedIn');
  return response.data;
};

// Get Authenticated User API call - optimized to minimize 401 requests
export const getAuthUser = async () => {
  try {
    // Check multiple indicators before making the request
    const hasAuthCookie = document.cookie.includes('jwt=');
    const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true';

    // If no indicators of being logged in, don't make the request
    if (!hasAuthCookie && !hasLoginFlag) {
      // Clear any stale login flag
      localStorage.removeItem('isLoggedIn');
      return null;
    }

    const response = await fetch(`${import.meta.env.MODE === "development" ? "http://localhost:5002" : ""}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear login flag if we get 401
        localStorage.removeItem('isLoggedIn');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Ensure login flag is set if we get valid user data
    if (data?.user) {
      localStorage.setItem('isLoggedIn', 'true');
    }
    return data;
  } catch (error) {
    // Clear login flag on any auth error
    localStorage.removeItem('isLoggedIn');
    return null;
  }
};

export async function getUserFriends() {
  try {
    const response = await silentAxiosInstance.get("/users/friends");
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (error.response?.status !== 401) {
      console.error("Error fetching user friends:", error.response?.data || error.message);
    }
    // Return empty array instead of throwing error to prevent UI crash
    return [];
  }
}

// FIXED: Changed endpoint from "/users/friends" to "/users"
export async function getRecommendedUsers() {
  try {
    const response = await silentAxiosInstance.get("/users/recommended");
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (error.response?.status !== 401) {
      console.error("Error fetching recommended friends:", error);
    }
    throw error;
  }
}

// Get outgoing friend requests
// Get outgoing friend requests (frontend expects an array)
export const getOutgoingFriendRequests = async () => {
  try {
    const res = await silentAxiosInstance.get('/users/outgoing-friends-requests');
    // backend returns { success: true, outgoingRequests: [...] }
    if (Array.isArray(res.data)) return res.data;
    return res.data?.outgoingRequests ?? [];
  } catch (err) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (err.response?.status !== 401) {
      console.error('Error fetching outgoing friend requests:', err);
    }
    return [];
  }
};

// FIXED: Corrected endpoint path (added 's' to 'friends')
export async function sendFriendRequest(userId) {
  try {
    const response = await axiosInstance.post(`/users/friends-request/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
}
// Get incoming friend requests (backend uses GET /users/friends-requests)
export const getFriendRequests = async () => {
  try {
    const res = await silentAxiosInstance.get("/users/friends-requests");
    const data = res.data ?? {};
    return {
      incomingRequests: Array.isArray(data.incomingRequests)
        ? data.incomingRequests
        : (data.incomingRequests ?? data.data?.incomingRequests ?? []),
      acceptedRequests: Array.isArray(data.acceptedRequests)
        ? data.acceptedRequests
        : (data.acceptedRequests ?? data.data?.acceptedRequests ?? []),
    };
  } catch (err) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (err.response?.status !== 401) {
      console.error("Error getting friend requests:", err);
    }
    // return safe empty shape so UI won't crash and react-query won't re-throw
    return { incomingRequests: [], acceptedRequests: [] };
  }
};
// Accept friend request: backend expects PUT /users/friends-request/:id/accept
export async function acceptFriendRequest(userId) {
  try {
    const response = await axiosInstance.put(`/users/friends-request/${userId}/accept`);
    return response.data;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
}

// Reject friend request: backend expects PUT /users/friends-request/:id/reject
export async function rejectFriendRequest(userId) {
  try {
    const response = await axiosInstance.put(`/users/friends-request/${userId}/reject`);
    return response.data;
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    throw error;
  }
}

// Cancel sent friend request: backend expects DELETE /users/friends-request/:id/cancel
export async function cancelFriendRequest(userId) {
  try {
    const response = await axiosInstance.delete(`/users/friends-request/${userId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    throw error;
  }
}

export const getStreamToken = async (targetUserId = null) => {
  try {
    // pass optional target param so server can upsert the other user
    const res = await silentAxiosInstance.get('/stream/token', {
      params: targetUserId ? { target: targetUserId } : {},
    });
    if (res?.data?.token) return res.data.token;
    if (res?.data?.data?.token) return res.data.data.token;
    return null;
  } catch (err) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (err.response?.status !== 401) {
      console.error('Error getting stream token:', err?.response?.data || err.message);
    }
    return null;
  }
};

// Call Management APIs
export const initiateCall = async (participants, type = 'video') => {
  try {
    const response = await axiosInstance.post('/calls/initiate', {
      participants,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
};

export const respondToCall = async (callId, response) => {
  try {
    const res = await axiosInstance.post('/calls/respond', {
      callId,
      response
    });
    return res.data;
  } catch (error) {
    console.error('Error responding to call:', error);
    throw error;
  }
};

export const getCallDetails = async (callId) => {
  try {
    const response = await silentAxiosInstance.get(`/calls/${callId}`);
    return response.data;
  } catch (error) {
    // Don't log 404 errors as they're expected for direct calls
    if (error.response?.status !== 404) {
      console.error('Error getting call details:', error);
    }
    throw error;
  }
};

export const endCall = async (callId) => {
  try {
    const response = await axiosInstance.post(`/calls/${callId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

export const getUserActiveCalls = async () => {
  try {
    const response = await silentAxiosInstance.get('/calls/user/active');
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (error.response?.status !== 401) {
      console.error('Error getting active calls:', error);
    }
    return { calls: [] };
  }
};

// Group Management APIs
export const createGroup = async (groupData) => {
  try {
    const response = await axiosInstance.post('/groups/create', groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const getUserGroups = async () => {
  try {
    const response = await silentAxiosInstance.get('/groups/my-groups');
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (error.response?.status !== 401) {
      console.error('Error getting user groups:', error);
    }
    return { groups: [] };
  }
};

export const addMemberToGroup = async (groupId, userId) => {
  try {
    const response = await axiosInstance.post(`/groups/${groupId}/add-member`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error adding member to group:', error);
    throw error;
  }
};

export const leaveGroup = async (groupId) => {
  try {
    const response = await axiosInstance.delete(`/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const getPotentialMembers = async (groupId) => {
  try {
    const response = await axiosInstance.get(`/groups/${groupId}/potential-members`);
    return response.data;
  } catch (error) {
    console.error('Error getting potential members:', error);
    throw error;
  }
};

export const removeMemberFromGroup = async (groupId, memberId) => {
  try {
    const response = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing member from group:', error);
    throw error;
  }
};
// Group Call APIs
export const startGroupCall = async (groupId, callType, callId) => {
  try {
    const response = await axiosInstance.post('/group-calls/start', {
      groupId,
      callType,
      callId
    });
    return response.data;
  } catch (error) {
    console.error('Error starting group call:', error);
    throw error;
  }
};

export const endGroupCall = async (groupId, callId) => {
  try {
    const response = await axiosInstance.post('/group-calls/end', {
      groupId,
      callId
    });
    return response.data;
  } catch (error) {
    console.error('Error ending group call:', error);
    throw error;
  }
};

export const joinGroupCall = async (groupId, callId) => {
  try {
    const response = await axiosInstance.post('/group-calls/join', {
      groupId,
      callId
    });
    return response.data;
  } catch (error) {
    console.error('Error joining group call:', error);
    throw error;
  }
};

// Admin APIs
export const getAdminStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const deleteUserById = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
