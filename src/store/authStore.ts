import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/index';
import { clearTokens, getAccessToken } from '../services/auth';

interface AuthUser extends User {
  cognito_sub?: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setAuth: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      logout: () => {
        // Clear JWT tokens from localStorage
        clearTokens();

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const token = getAccessToken();
        const { user } = get();

        if (!token || !user) {
          // No valid auth, clear state
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
          return false;
        }

        return true;
      },
    }),
    {
      name: 'citypulse-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
