import axios from 'axios';

const BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5002/api"
  : "/api";

// Regular axios instance for normal requests
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Silent axios instance that completely suppresses console output
export const silentAxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Add response interceptor to main instance
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on auth endpoints
      const isAuthEndpoint = error.config?.url?.includes('/auth/');

      if (!isAuthEndpoint) {
        console.log('Unauthorized access, redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Completely silent instance - no logging at all
silentAxiosInstance.interceptors.request.use(
  (config) => {
    // Mark this request as silent
    config.metadata = { silent: true };
    return config;
  },
  (error) => Promise.reject(error)
);

silentAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log anything for silent requests
    // Create a clean error object without axios internals
    const cleanError = {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data
      },
      config: {
        url: error.config?.url,
        method: error.config?.method
      },
      code: error.code
    };

    // Return a promise rejection that won't trigger console logs
    return new Promise((_, reject) => {
      reject(cleanError);
    });
  }
);