
import { create } from 'zustand';
import axios from '../utils/axiosInstance'
import { Res } from '@/types/response';
import { Auth, Role, User } from '@/types/user';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  user: User | null;
  users: User[]
  token: string;
  isAuthenticated: boolean;
  userRoles: Role[]; // Explicitly define userRoles in the interface
  login: ({ password, username }: { password: string, username: string }) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  addRole: (role: Role) => void;
  removeRole: (role: Role) => void;
  canManageRoles: () => boolean;
  canAccessRoute: (allowedRoles: Role[]) => boolean;
  canDoAction: (allowedRoles: string[]) => boolean;
  fetchUser: () => Promise<void>;
  UpdateUserRole: (roles: Role[]) => void;
}

// Load initial state from localStorage if available
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, userRoles: [] };
  }

  const savedAuth = localStorage.getItem('auth');

  if (savedAuth) {

    try {
      const auth: Auth = JSON.parse(savedAuth);
      console.log(auth.user)
      return {
        user: auth.user,
        token: auth.token,
        isAuthenticated: true,
        userRoles: auth.user.roles || []
      };

    } catch (error) {
      console.error("Error parsing saved authentication", error);
      // localStorage.removeItem('auth');
    }
  }

  return { user: null, isAuthenticated: false, userRoles: [] };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  users: [],
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  userRoles: initialState.userRoles || [], // Ensure userRoles is initialized
  login: async ({ username, password }) => {
    // const navigate = useNavigate();
    // const auth = await loginUser({password, username})

    const auth = await axios.post<Res<Auth>>(
      "/login",
      { username, password }
    );
    const user = auth.data.data.user;
    set({ user, isAuthenticated: true, userRoles: user.roles || [], token: auth.data.data.token });
    // Save authentication to localStorage
    if (user) {
      toast.success(`Welcome back, ${user.fullname}`);
    } else {
      toast.error('Invalid credentials');
    }

    localStorage.setItem('auth', JSON.stringify(auth.data.data));
  },


  logout: () => {
    set({ user: null, isAuthenticated: false, userRoles: [] });
    // Clear saved authentication
    localStorage.removeItem('auth');
  },
  hasRole: (role) => {
    const { user } = get();
    return user?.roles.some(r => r.name === role.name) || false;

  },
  addRole: (role) => {
    const { user } = get();
    if (user && !user?.roles.some(r => r.name === role.name)) {
      const updatedUser = {
        ...user,
        userRoles: [...user.roles, role]
      };
      set({
        user: updatedUser,
        userRoles: updatedUser.roles
      });
      // Update saved authentication
      localStorage.setItem('auth', JSON.stringify(updatedUser));
    }
  },
  removeRole: (role) => {
    const { user } = get();
    if (user) {
      const updatedUser = {
        ...user,
        userRoles: user.roles.filter((r) => r.name !== role.name)
      };
      set({
        user: updatedUser,
        userRoles: updatedUser.userRoles
      });
      // Update saved authentication
      localStorage.setItem('auth', JSON.stringify(updatedUser));
    }
  },
  canManageRoles: () => {
    const { user } = get();
    return user?.roles.some(r => r.name === 'admin') || user?.roles.some(r => r.name == 'principal') || false;
  },
  canAccessRoute: (allowedRoles) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.some(role => allowedRoles.some(r => r.name === role.name));

  },
  canDoAction: (allowedRoles) => {
    const { userRoles } = get();
    if (userRoles.length <= 0) return false;
    return userRoles.some(role => allowedRoles.some(r => r === role.name));
  },
  fetchUser: async () => {
    try {
      const response = await axios.get<Res<User[]>>("/accounts");
      const users = response.data.data;
      set({ users: users });
    } catch (error) {
      console.error("Failed to fetch user", error);

    }
  },
  UpdateUserRole: (roles) => {
    set({ userRoles: roles });
    const { user } = get();
    set({ userRoles: roles });
  }
}));

