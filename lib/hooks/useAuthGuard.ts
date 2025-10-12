import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from './useAuth';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/auth/sign-in',
    requireAuth = true,
    onAuthStateChange,
  } = options;

  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const { data: currentUser, isLoading: isUserLoading, error } = useCurrentUser();

  // Initialize auth state
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle authentication state changes
  useEffect(() => {
    const authState = isAuthenticated && (user || currentUser);
    onAuthStateChange?.(!!authState);

    if (requireAuth && !isLoading && !isUserLoading && !authState && !error) {
      router.replace(redirectTo as any);
    }
  }, [
    isAuthenticated,
    user,
    currentUser,
    isLoading,
    isUserLoading,
    error,
    requireAuth,
    redirectTo,
    router,
    onAuthStateChange,
  ]);

  return {
    user: user || currentUser,
    isAuthenticated: isAuthenticated && !!(user || currentUser),
    isLoading: isLoading || isUserLoading,
    error,
    requireAuth,
  };
}

// Hook for checking if user has specific permissions
export function usePermissions() {
  const { user } = useAuthStore();
  const { data: currentUser } = useCurrentUser();

  const activeUser = user || currentUser;

  return {
    user: activeUser,
    isAdmin: activeUser?.user_metadata?.role === 'admin',
    isBrand: activeUser?.user_metadata?.user_type === 'brand',
    isShopper: activeUser?.user_metadata?.user_type === 'shopper',
    hasPermission: (permission: string) => {
      // Add your permission logic here
      return activeUser?.user_metadata?.permissions?.includes(permission) || false;
    },
  };
}

// Hook for protected routes that require specific user types
export function useUserTypeGuard(requiredUserType: 'brand' | 'shopper' | 'admin') {
  const { user, isAuthenticated, isLoading } = useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userType = user.user_metadata?.user_type;
      
      if (userType !== requiredUserType) {
        // Redirect to appropriate dashboard based on user type
        switch (userType) {
          case 'brand':
            router.replace('/(brand)' as any);
            break;
          case 'shopper':
            router.replace('/(tabs)' as any);
            break;
          case 'admin':
            router.replace('/(tabs)' as any);
            break;
          default:
            router.replace('/brand-onboarding' as any);
            break;
        }
      }
    }
  }, [user, isAuthenticated, isLoading, requiredUserType, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasCorrectUserType: user?.user_metadata?.user_type === requiredUserType,
  };
}