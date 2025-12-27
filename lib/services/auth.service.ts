import api from '../api';

export interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role?: string;
}

export interface RefreshRequest {
  refreshToken: string;
  organizationId?: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: { email: string; otp: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-otp', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  },

  verifyToken: async (accessToken: string): Promise<{ id: string; email: string; name: string; loginMethod: string; organizationId: string | null; role: string | null }> => {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};
