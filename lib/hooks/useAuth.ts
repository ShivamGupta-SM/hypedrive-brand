import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { secureStorage } from '@/lib/storage/secureStorage';
import { AuthError, User, Session } from '@supabase/supabase-js';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Sign In Hook
export function useSignIn() {
  const { setSession, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignInCredentials): Promise<AuthResponse> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      // Store tokens securely
      if (data.session) {
        await secureStorage.setAccessToken(data.session.access_token);
        if (data.session.refresh_token) {
          await secureStorage.setRefreshToken(data.session.refresh_token);
        }
      }

      return { user: data.user, session: data.session, error: null };
    },
    onSuccess: (data) => {
      setSession(data.session);
      setLoading(false);
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Sign in error:', error);
      setLoading(false);
    },
  });
}

// Sign Up Hook
export function useSignUp() {
  const { setSession, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignUpCredentials): Promise<AuthResponse> => {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Store tokens securely if session is available
      if (data.session) {
        await secureStorage.setAccessToken(data.session.access_token);
        if (data.session.refresh_token) {
          await secureStorage.setRefreshToken(data.session.refresh_token);
        }
      }

      return { user: data.user, session: data.session, error: null };
    },
    onSuccess: (data) => {
      if (data.session) {
        setSession(data.session);
      }
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Sign up error:', error);
      setLoading(false);
    },
  });
}

// Sign Out Hook
export function useSignOut() {
  const { signOut } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear secure storage
      await secureStorage.removeTokens();
    },
    onSuccess: () => {
      signOut();
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });
}

// Get Current User Hook
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: user,
  });
}

// Session Hook
export function useSession() {
  const { session, setSession } = useAuthStore();

  const query = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: session,
  });

  // Update session when data changes
  React.useEffect(() => {
    if (query.data !== undefined) {
      setSession(query.data);
    }
  }, [query.data, setSession]);

  return query;
}

// Password Reset Hook
export function usePasswordReset() {
  return useMutation({
    mutationFn: async (email: string): Promise<void> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'hypedrive://reset-password',
      });
      if (error) {
        throw error;
      }
    },
  });
}

// Update Password Hook
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string): Promise<void> => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw error;
      }
    },
  });
}

// Auth State Change Listener Hook
export function useAuthStateChange() {
  const { setSession, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'listener'],
    queryFn: () => {
      return new Promise((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            setLoading(true);
            
            if (session) {
              // Store tokens securely
              await secureStorage.setAccessToken(session.access_token);
              if (session.refresh_token) {
                await secureStorage.setRefreshToken(session.refresh_token);
              }
              setSession(session);
            } else {
              // Clear tokens
              await secureStorage.removeTokens();
              setSession(null);
            }
            
            setLoading(false);
          }
        );

        // Return cleanup function
        resolve(() => subscription.unsubscribe());
      });
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}