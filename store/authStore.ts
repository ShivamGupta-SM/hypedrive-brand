import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Keychain from 'react-native-keychain';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Custom storage implementation using react-native-keychain
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const credentials = await Keychain.getInternetCredentials(name);
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error getting item from keychain:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await Keychain.setInternetCredentials(name, 'auth', value);
    } catch (error) {
      console.error('Error setting item in keychain:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await Keychain.resetInternetCredentials({ server: name });
    } catch (error) {
      console.error('Error removing item from keychain:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setSession: (session) => {
        set({ 
          session,
          user: session?.user || null,
          isAuthenticated: !!session?.user 
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      signOut: async () => {
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false,
          isLoading: false 
        });
        // Clear secure storage
        try {
          await secureStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Error clearing auth storage:', error);
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        // This will be called when the app starts to restore auth state
        // The persist middleware will handle loading from secure storage
        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);