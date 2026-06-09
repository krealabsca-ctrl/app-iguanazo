import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthProvider = 'google' | 'apple' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  provider: AuthProvider;
}

export const LOGIN_GRACE_MS = 24 * 60 * 60 * 1000; // 24h after first launch

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  biometricEnabled: boolean;
  /** Epoch ms of first app launch. Used to defer the forced login screen. */
  firstLaunchAt: number | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setHydrated: () => void;
  /** Returns true once the 24h grace period since install has elapsed. */
  isLoginRequired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      biometricEnabled: false,
      firstLaunchAt: null,
      signIn: (user) => set({ user, isAuthenticated: true }),
      signOut: () => set({ user: null, isAuthenticated: false, biometricEnabled: false }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setHydrated: () => set({ isHydrated: true }),
      isLoginRequired: () => {
        const t = get().firstLaunchAt;
        if (t == null) return false;
        return Date.now() - t >= LOGIN_GRACE_MS;
      },
    }),
    {
      name: 'laiguana-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled,
        firstLaunchAt: state.firstLaunchAt,
      }),
      onRehydrateStorage: () => (state) => {
        // Stamp install time on first ever hydration.
        if (state && state.firstLaunchAt == null) {
          state.firstLaunchAt = Date.now();
        }
        state?.setHydrated();
      },
    },
  ),
);
