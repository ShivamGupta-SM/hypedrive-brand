import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { supabase } from '../supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurrentUser, useCurrentSession } from '../query/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: session, isLoading: sessionLoading } = useCurrentSession();
  
  const loading = userLoading || sessionLoading;

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            // Store session info for persistence
            if (session) {
              await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
            }
            // Redirect to appropriate screen based on user type/status
            handleAuthRedirect(session?.user);
            break;
            
          case 'SIGNED_OUT':
            // Clear stored session
            await AsyncStorage.removeItem('supabase_session');
            // Redirect to auth screen
            router.replace('/(auth)/login');
            break;
            
          case 'TOKEN_REFRESHED':
            // Update stored session
            if (session) {
              await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
            }
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthRedirect = async (user: User | null | undefined) => {
    if (!user) return;

    try {
      // Check if user has completed brand setup
      // This will be implemented based on your brand onboarding flow
      // For now, redirect to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error in auth redirect:', error);
      // Fallback to main screen
      router.replace('/');
    }
  };

  const value: AuthContextType = {
    user: user ?? null,
    session: session ?? null,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;