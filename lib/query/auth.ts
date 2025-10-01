import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../supabase/services/auth';
import type { User, Session } from '@supabase/supabase-js';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Types for authentication operations
type SignInData = {
  email: string;
  password: string;
};

type SignUpData = {
  email: string;
  password: string;
  metadata?: Record<string, any>;
};

type ResetPasswordData = {
  email: string;
};

type UpdatePasswordData = {
  newPassword: string;
};

type UpdateMetadataData = {
  metadata: Record<string, any>;
};

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: AuthService.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Hook to get the current session
 */
export function useCurrentSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: AuthService.getCurrentSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Hook for signing in with email and password
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: SignInData) =>
      AuthService.signInWithEmail(email, password),
    onSuccess: (data) => {
      // Update user and session cache
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.session(), data.session);
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });
}

/**
 * Hook for signing up with email and password
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, metadata }: SignUpData) =>
      AuthService.signUpWithEmail(email, password, metadata),
    onSuccess: (data) => {
      // Update user and session cache if user is confirmed
      if (data.user && data.session) {
        queryClient.setQueryData(authKeys.user(), data.user);
        queryClient.setQueryData(authKeys.session(), data.session);
      }
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });
}

/**
 * Hook for signing out
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.signOut,
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Clear all cached data on sign out
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });
}

/**
 * Hook for password reset
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email }: ResetPasswordData) =>
      AuthService.resetPassword(email),
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({ newPassword }: UpdatePasswordData) =>
      AuthService.updatePassword(newPassword),
    onError: (error) => {
      console.error('Update password error:', error);
    },
  });
}

/**
 * Hook for updating user metadata
 */
export function useUpdateUserMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ metadata }: UpdateMetadataData) =>
      AuthService.updateUserMetadata(metadata),
    onSuccess: (data) => {
      // Update user cache with new metadata
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error('Update user metadata error:', error);
    },
  });
}