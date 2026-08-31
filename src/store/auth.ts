import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loadDemo: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const { db } = await import('../data/db');
        const user = await db.users.where('email').equals(email).first();
        if (user && user.password === password) {
          set({ currentUser: user, isAuthenticated: true });
          return user;
        }
        return null;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      loadDemo: async () => {
        const { db, initializeDatabase } = await import('../data/db');
        await initializeDatabase();
        const patient = await db.users.get('patient-1');
        if (patient) {
          set({ currentUser: patient, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'mindcare-auth',
      partialize: (state) => ({ currentUser: state.currentUser, isAuthenticated: state.isAuthenticated }),
    }
  )
);
