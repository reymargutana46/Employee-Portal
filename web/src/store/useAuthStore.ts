/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import axios from '../utils/axiosInstance'
import { Res } from '@/types/response';
import { Auth, Role, User } from '@/types/user';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  users: User[]
  token: string | null;
  isAuthenticated: boolean;
  userRoles: Role[];
  login: ({ password, username }: { password: string, username: string }) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  addRole: (role: Role) => void;
  removeRole: (role: Role) => void;
  canManageRoles: () => boolean;
  canAccessRoute: (allowedRoles: Role[]) => boolean;
  canDoAction: (allowedRoles: string[]) => boolean;
  fetchUser: () => Promise<void>;
  UpdateUserRole: (roles: Role[]) => void;
  clearAuthState: () => void; // New method for complete cleanup
}

// Load initial state from localStorage if available
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      userRoles: []
    };
  }

  try {
    const savedAuth = localStorage.getItem('auth');

    if (savedAuth) {
      const auth: Auth = JSON.parse(savedAuth);

      // Validate the auth object structure
      if (auth && auth.user && auth.token && auth.user.roles) {
        console.log('Loading saved auth for user:', auth.user.username);
        return {
          user: auth.user,
          token: auth.token,
          isAuthenticated: true,
          userRoles: auth.user.roles
        };
      }
    }
  } catch (error) {
    console.error("Error parsing saved authentication", error);
    // Clear corrupted localStorage data
    localStorage.removeItem('auth');
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    userRoles: []
  };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  users: [],
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  userRoles: initialState.userRoles,

  clearAuthState: () => {
    console.log('Clearing auth state completely');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      userRoles: [],
      users: [] // Also clear users list for security
    });
  },

  login: async ({ username, password }) => {
    try {
      console.log('Attempting login for:', username);

      // Clear any existing auth state before login
      get().clearAuthState();
      localStorage.removeItem('auth');

      const response = await axios.post<Res<Auth>>(
        "/login",
        { username, password }
      );

      const authData = response.data.data;
      const user = authData.user;
      const token = authData.token;

      // Validate response structure
      if (!user || !token || !user.roles) {
        throw new Error('Invalid login response structure');
      }

      console.log('Login successful for user:', user.username, 'with roles:', user.roles);

      // Update state with new authentication
      set({
        user,
        token,
        isAuthenticated: true,
        userRoles: user.roles
      });

      // Save to localStorage
      const authToSave = {
        user,
        token
      };
      localStorage.setItem('auth', JSON.stringify(authToSave));
    window.location.href = "/dashboard";

      toast.success(`Welcome back, ${user.fullname || user.username}`);

    } catch (error: any) {
      console.error('Login failed:', error);

      // Ensure clean state on login failure
      get().clearAuthState();
      localStorage.removeItem('auth');

      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);

      throw error; // Re-throw to allow caller to handle
    }
  },

  logout: () => {
    console.log('Logging out user');

    // Clear localStorage first
    localStorage.removeItem('auth');

    // Clear all auth state
    get().clearAuthState();

    toast.success('Logged out successfully');
  },

  hasRole: (role) => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user || !user.roles) {
      return false;
    }
    return user.roles.some(r => r.name === role.name);
  },

  addRole: (role) => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user || !user.roles) {
      console.warn('Cannot add role: user not authenticated');
      return;
    }

    if (!user.roles.some(r => r.name === role.name)) {
      const updatedUser = {
        ...user,
        roles: [...user.roles, role]
      };

      set({
        user: updatedUser,
        userRoles: updatedUser.roles
      });

      // Update localStorage with complete auth object
      const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}');
      const updatedAuth = {
        ...currentAuth,
        user: updatedUser
      };
      localStorage.setItem('auth', JSON.stringify(updatedAuth));
    }
  },

  removeRole: (role) => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user || !user.roles) {
      console.warn('Cannot remove role: user not authenticated');
      return;
    }

    const updatedUser = {
      ...user,
      roles: user.roles.filter((r) => r.name !== role.name)
    };

    set({
      user: updatedUser,
      userRoles: updatedUser.roles
    });

    // Update localStorage with complete auth object
    const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}');
    const updatedAuth = {
      ...currentAuth,
      user: updatedUser
    };
    localStorage.setItem('auth', JSON.stringify(updatedAuth));
  },

  canManageRoles: () => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user || !user.roles) {
      return false;
    }
    return user.roles.some(r => r.name === 'admin' || r.name === 'principal');
  },

  canAccessRoute: (allowedRoles) => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user || !user.roles || allowedRoles.length === 0) {
      return false;
    }
    return user.roles.some(role =>
      allowedRoles.some(allowedRole => allowedRole.name === role.name)
    );
  },

  canDoAction: (allowedRoles) => {
    const { userRoles, isAuthenticated } = get();
    if (!isAuthenticated || !userRoles || userRoles.length === 0 || allowedRoles.length === 0) {
      return false;
    }
    return userRoles.some(role => allowedRoles.includes(role.name));
  },

  fetchUser: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) {
      console.warn('Cannot fetch users: not authenticated');
      return;
    }

    try {
      const response = await axios.get<Res<User[]>>("/accounts");
      const users = response.data.data;
      set({ users });
    } catch (error) {
      console.error("Failed to fetch users", error);

      // If it's an auth error, clear the state
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error detected, clearing auth state');
        get().logout();
      }
    }
  },

  UpdateUserRole: (roles) => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user) {
      console.warn('Cannot update user roles: not authenticated');
      return;
    }

    const updatedUser = {
      ...user,
      roles: roles
    };

    set({
      userRoles: roles,
      user: updatedUser
    });

    // Update localStorage
    const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}');
    const updatedAuth = {
      ...currentAuth,
      user: updatedUser
    };
    localStorage.setItem('auth', JSON.stringify(updatedAuth));
  }
}));
