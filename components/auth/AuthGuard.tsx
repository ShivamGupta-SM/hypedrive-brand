import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/lib/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/auth/sign-in' 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  useEffect(() => {
    // Initialize auth state on mount
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    // Redirect to auth screen if not authenticated and not loading
    if (!isLoading && !isUserLoading && !isAuthenticated && !user) {
      router.replace(redirectTo as any);
    }
  }, [isAuthenticated, user, isLoading, isUserLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading || isUserLoading) {
    return (
      fallback || (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )
    );
  }

  // Show children only if authenticated
  if (isAuthenticated && (user || currentUser)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}

// Higher-order component version for easier usage
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard 
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}