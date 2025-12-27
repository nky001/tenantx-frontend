import axios from 'axios';
import { useAuthStore } from './auth-store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const authEndpoints = ['/auth/register', '/auth/login', '/auth/verify-otp', '/auth/resend-otp', '/auth/forgot-password'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      const state = useAuthStore.getState();
      const refreshToken = state.refreshToken;
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:8080/auth/refresh', {
            refreshToken,
            organizationId: state.selectedOrganizationId,
          }, { withCredentials: true });
          
          useAuthStore.getState().setTokens(res.data.accessToken, res.data.refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          const err = refreshError as { response?: { status?: number } };
          if (err?.response?.status === 401) {
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;