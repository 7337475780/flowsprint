import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../api/authApi.js";
import { getCurrentUser, logout as apiLogout } from "../api/authApi.js";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setCredentials: (user: User, token: string) => void;
  setUser: (user: Partial<User>) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      /**
       * Called after login/register
       * Saves token + full user
       */
      setCredentials: (user, token) => {
        localStorage.setItem("fs_token", token);

        set({
          user,
          token,
          isAuthenticated: true,
          isHydrated: true,
        });
      },

      /**
       * Partial profile update
       * Example:
       * setUser({ avatar: cloudinaryUrl })
       * setUser({ name: "Tharun" })
       */
      setUser: (updatedUser) =>
        set((state) => ({
          user: state.user
            ? {
              ...state.user,
              ...updatedUser,
            }
            : (updatedUser as User),
        })),

      /**
       * Logout
       */
      logout: () => {
        apiLogout().catch(() => { });

        localStorage.removeItem("fs_token");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isHydrated: true,
        });
      },

      /**
       * App startup hydration
       * Verifies token and fetches latest user
       */
      hydrate: async () => {
        const token = localStorage.getItem("fs_token") || get().token;

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isHydrated: true,
          });
          return;
        }

        set({ isLoading: true });

        try {
          // Backend should return latest user including Cloudinary avatar URL
          const user = await getCurrentUser();

          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch {
          // Invalid token
          localStorage.removeItem("fs_token");

          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } finally {
          set({
            isLoading: false,
            isHydrated: true,
          });
        }
      },
    }),
    {
      name: "fs-auth",

      /**
       * Persist token + user
       * So Cloudinary avatar stays visible after refresh
       */
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);