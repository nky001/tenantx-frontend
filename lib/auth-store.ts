import { create } from 'zustand';
import { Buffer } from 'buffer';
import { authService } from './services';

const setStorage = (name: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(name, value);
  } catch (_error) {
  }
};

const getStorage = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(name);
  } catch (_error) {
    return null;
  }
};

const removeStorage = (name: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(name);
  } catch (_error) {
  }
};

const decodeBase64 = (value: string) => {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'base64').toString('binary');
  }
  return atob(value);
};

const decodeJwtPayload = (token: string) => {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format');
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const decoded = decodeBase64(padded);
  return JSON.parse(decoded);
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  organizationId: string | null;
  role: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  loginMethod: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isVerifying: boolean;
  verificationInterval: NodeJS.Timeout | null;
  selectedOrganizationId: string | null;
  selectedOrganizationName: string | null;
  setTokens: (access: string, refresh: string) => void;
  setOrg: (orgId: string | null, role: string | null) => void;
  setSelectedOrganization: (orgId: string | null, orgName: string | null) => void;
  logout: () => void;
  loadFromCookies: () => Promise<void>;
  verifyAuth: () => Promise<boolean>;
  startPeriodicVerification: () => void;
  stopPeriodicVerification: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  refreshToken: null,
  organizationId: null,
  role: null,
  userId: null,
  userEmail: null,
  userName: null,
  loginMethod: null,
  isAuthenticated: false,
  isHydrated: false,
  isVerifying: false,
  verificationInterval: null,
  selectedOrganizationId: null,
  selectedOrganizationName: null,
  
  setTokens: (access, refresh) => {
    try {
      const payload = decodeJwtPayload(access);
      
      setStorage('accessToken', access);
      setStorage('refreshToken', refresh);
      setStorage('userId', payload.sub);
      setStorage('role', payload.role || '');
      if (payload.org) setStorage('organizationId', payload.org);
      
      set({
        accessToken: access,
        refreshToken: refresh,
        userId: payload.sub,
        organizationId: payload.org || null,
        role: payload.role,
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch (_error) {
    }
  },
  
  setOrg: (orgId, role) => {
    if (orgId) setStorage('organizationId', orgId);
    if (role) setStorage('role', role);
    set({ organizationId: orgId, role });
  },
  
  setSelectedOrganization: (orgId, orgName) => {
    if (orgId) {
      setStorage('selectedOrganizationId', orgId);
    } else {
      removeStorage('selectedOrganizationId');
    }
    if (orgName) {
      setStorage('selectedOrganizationName', orgName);
    } else {
      removeStorage('selectedOrganizationName');
    }
    set({ selectedOrganizationId: orgId, selectedOrganizationName: orgName });
  },
  
  logout: () => {
    // Stop periodic verification
    get().stopPeriodicVerification();

    removeStorage('accessToken');
    removeStorage('refreshToken');
    removeStorage('userId');
    removeStorage('organizationId');
    removeStorage('role');
    removeStorage('selectedOrganizationId');
    removeStorage('selectedOrganizationName');
    set({
      accessToken: null,
      refreshToken: null,
      organizationId: null,
      role: null,
      userId: null,
      userEmail: null,
      userName: null,
      loginMethod: null,
      isAuthenticated: false,
      isHydrated: true,
      verificationInterval: null,
      selectedOrganizationId: null,
      selectedOrganizationName: null,
    });
  },
  
  loadFromCookies: async () => {
    const accessToken = getStorage('accessToken');
    const refreshToken = getStorage('refreshToken');
    const userId = getStorage('userId');
    const organizationId = getStorage('organizationId');
    const role = getStorage('role');
    const selectedOrganizationId = getStorage('selectedOrganizationId');
    const selectedOrganizationName = getStorage('selectedOrganizationName');
    
    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        userId,
        organizationId,
        role,
        isAuthenticated: true,
        isHydrated: true,
        selectedOrganizationId,
        selectedOrganizationName,
      });
    } else {
      set({
        accessToken: null,
        refreshToken: null,
        userId: null,
        organizationId: null,
        role: null,
        userEmail: null,
        userName: null,
        loginMethod: null,
        isAuthenticated: false,
        isHydrated: true,
        verificationInterval: null,
        selectedOrganizationId: null,
        selectedOrganizationName: null,
      });
    }
  },
  
  verifyAuth: async () => {
    try {
      set({ isVerifying: true });
      const accessToken = getStorage('accessToken');
      
      if (!accessToken) {
        get().logout();
        set({ isVerifying: false });
        return false;
      }

      const userInfo = await authService.verifyToken(accessToken);
      set({
        userId: userInfo.id,
        userEmail: userInfo.email,
        userName: userInfo.name,
        loginMethod: userInfo.loginMethod,
        organizationId: userInfo.organizationId,
        role: userInfo.role,
        isAuthenticated: true,
      });
      set({ isVerifying: false });
      return true;
    } catch (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        get().logout();
      }
      set({ isVerifying: false });
      return false;
    }
  },

  startPeriodicVerification: () => {
    // Clear any existing interval
    get().stopPeriodicVerification();

    // Start new interval - verify every 5 minutes
    const interval = setInterval(async () => {
      await get().verifyAuth();
    }, 5 * 60 * 1000); // 5 minutes

    set({ verificationInterval: interval });
  },

  stopPeriodicVerification: () => {
    const { verificationInterval } = get();
    if (verificationInterval) {
      clearInterval(verificationInterval);
      set({ verificationInterval: null });
    }
  },
}));