
import React, { createContext, useContext } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Role, User } from '@/types/user';




interface AuthContextType {
  user: User | null;
  userRoles: Role[];
  isAuthenticated: boolean;
  login: ({ username, password }: { username: string; password: string }) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  addRole: (role: Role) => void;
  removeRole: (role: Role) => void;
  canManageRoles: () => boolean;
  canAccessRoute: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRoles: [],
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  addRole: () => {},
  removeRole: () => {},
  canManageRoles: () => false,
  canAccessRoute: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use the Zustand store directly
  const authStore = useAuthStore();

  const value = {
    user: authStore.user,
    userRoles: authStore.userRoles, // Now correctly accessing the explicit userRoles property
    isAuthenticated: authStore.isAuthenticated,
    login: authStore.login,
    logout: authStore.logout,
    hasRole: authStore.hasRole,
    addRole: authStore.addRole,
    removeRole: authStore.removeRole,
    canManageRoles: authStore.canManageRoles,
    canAccessRoute: authStore.canAccessRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
