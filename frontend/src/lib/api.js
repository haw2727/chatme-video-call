import { axiosInstance } from './axios.js';

// Signup API call
export const signup = async (signupData) => {
  const response = await axiosInstance.post('/auth/signup', signupData);
  return response.data;
};

// Login API call
export const login = async (loginData) => {
  const response = await axiosInstance.post('/auth/login', loginData);
  return response.data;
};

// Logout API Call
export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// Get Authenticated User API call
export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    console.log("Error in getAuthUser", error);
    return null;
  }
};

// Complete Onboarding API call
export const completeOnboardingData = async (userData) => {
  const response = await axiosInstance.post('/auth/onboarding', userData);
  return response.data;
};   

export async function getUserFriends() {
  try {
    const response = await axiosInstance.get("/users/friends");
    console.log('Friends API response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Error fetching user friends:", error.response?.data || error.message);
    // Return empty array instead of throwing error to prevent UI crash
    return [];
  }
}

// FIXED: Changed endpoint from "/users/friends" to "/users"
export async function getRecommendedUsers() {
  try {
    const response = await axiosInstance.get("/users/recommended");
    return response.data; // Access the data property from backend response
  } catch (error) {
    console.error("Error fetching recommended friends:", error);
    throw error;
  }
}

// Get outgoing friend requests
// Get outgoing friend requests (frontend expects an array)
export const getOutgoingFriendRequests = async () => {
  try {
    const res = await axiosInstance.get('/users/outgoing-friends-requests');
    // backend returns { success: true, outgoingRequests: [...] }
    if (Array.isArray(res.data)) return res.data;
    return res.data?.outgoingRequests ?? [];
  } catch (err) {
    console.error('Error fetching outgoing friend requests:', err);
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
    const res = await axiosInstance.get("/users/friends-requests");
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
    console.error("Error getting friend requests:", err);
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

export const getStreamToken = async (targetUserId = null) => {
  try {
    // pass optional target param so server can upsert the other user
    const res = await axiosInstance.get('/stream/token', {
      params: targetUserId ? { target: targetUserId } : {},
    });
    if (res?.data?.token) return res.data.token;
    if (res?.data?.data?.token) return res.data.data.token;
    return null;
  } catch (err) {
    console.error('Error getting stream token:', err?.response?.data || err.message);
    return null;
  }
};