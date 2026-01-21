import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient, getAPIErrorMessage, getAPIErrorCode } from "@/hooks/use-api";

// Types - User matches API's UserResponse type
interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  organizationStatus?: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

interface ForgotPasswordParams {
  email: string;
}

interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

type SocialProvider = "google" | "apple";

interface SocialLoginResult {
  success: boolean;
  redirectUrl?: string;
  error?: { name: string; message: string; code?: string };
}

interface AuthResult {
  success: boolean;
  error?: { name: string; message: string; code?: string };
  redirectTo?: string;
}

// Separate loading states for each auth action to prevent race conditions
interface LoadingStates {
  login: boolean;
  register: boolean;
  logout: boolean;
  forgotPassword: boolean;
  resetPassword: boolean;
  socialLogin: boolean;
}

export interface AuthState {
  // State
  token: string | null;
  user: User | null;
  loadingStates: LoadingStates;
  isInitialized: boolean; // True after app initialization (rehydration)

  // Computed
  isAuthenticated: boolean;

  // Actions
  initialize: () => void; // Call once on app start - just marks as initialized
  login: (params: LoginParams) => Promise<AuthResult>;
  register: (params: RegisterParams) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  forgotPassword: (params: ForgotPasswordParams) => Promise<AuthResult>;
  resetPassword: (params: ResetPasswordParams) => Promise<AuthResult>;
  socialLogin: (provider: SocialProvider) => Promise<SocialLoginResult>;
  clearAuth: () => void;
}

// Helper to create auth error result with specific error code handling
function createAuthError(
  error: unknown,
  errorName: string,
  fallbackMessage: string
): AuthResult {
  const code = getAPIErrorCode(error) || undefined;
  const message = getAPIErrorMessage(error, fallbackMessage);

  return {
    success: false,
    error: { name: errorName, message, code },
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      loadingStates: {
        login: false,
        register: false,
        logout: false,
        forgotPassword: false,
        resetPassword: false,
        socialLogin: false,
      },
      isInitialized: false,
      isAuthenticated: false,

      // Actions
      clearAuth: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          loadingStates: {
            login: false,
            register: false,
            logout: false,
            forgotPassword: false,
            resetPassword: false,
            socialLogin: false,
          },
          isInitialized: true, // Keep initialized after logout
        });
      },

      // Initialize app - call once on app start after rehydration
      // Organization profile is now fetched via TanStack Query (useOrganizationProfile)
      initialize: () => {
        const { isInitialized } = get();
        if (isInitialized) return;
        set({ isInitialized: true });
      },

      login: async (params) => {
        set((state) => ({ loadingStates: { ...state.loadingStates, login: true } }));
        try {
          const response = await apiClient.auth.signInEmail({
            email: params.email,
            password: params.password,
          });

          if (response.token && response.user) {
            set((state) => ({
              token: response.token,
              user: response.user,
              isAuthenticated: true,
              loadingStates: { ...state.loadingStates, login: false },
            }));
            return { success: true, redirectTo: "/" };
          }

          set((state) => ({ loadingStates: { ...state.loadingStates, login: false } }));
          return {
            success: false,
            error: { name: "LoginError", message: "Invalid email or password" },
          };
        } catch (error: unknown) {
          set((state) => ({ loadingStates: { ...state.loadingStates, login: false } }));
          return createAuthError(error, "LoginError", "Login failed");
        }
      },

      register: async (params) => {
        set((state) => ({ loadingStates: { ...state.loadingStates, register: true } }));
        try {
          const response = await apiClient.auth.signUpEmail({
            email: params.email,
            password: params.password,
            name: params.name,
          });

          if (response.token && response.user) {
            set((state) => ({
              token: response.token,
              user: response.user,
              isAuthenticated: true,
              loadingStates: { ...state.loadingStates, register: false },
            }));
            // New users need to complete onboarding (organization profile creation)
            return { success: true, redirectTo: "/onboarding" };
          }

          set((state) => ({ loadingStates: { ...state.loadingStates, register: false } }));
          return {
            success: false,
            error: { name: "RegisterError", message: "Registration failed" },
          };
        } catch (error: unknown) {
          set((state) => ({ loadingStates: { ...state.loadingStates, register: false } }));
          return createAuthError(error, "RegisterError", "Registration failed");
        }
      },

      logout: async () => {
        set((state) => ({ loadingStates: { ...state.loadingStates, logout: true } }));
        try {
          await apiClient.auth.signOut();
        } catch {
          // Ignore errors on logout
        }

        // Clear React Query cache to prevent stale data on re-login
        const { queryClient } = await import("@/App");
        queryClient.clear();

        // Clear organization store
        const { useOrganizationStore } = await import("@/store/organization-store");
        useOrganizationStore.getState().clearOrganization();

        set({
          token: null,
          user: null,
          isAuthenticated: false,
          loadingStates: {
            login: false,
            register: false,
            logout: false,
            forgotPassword: false,
            resetPassword: false,
            socialLogin: false,
          },
          isInitialized: true, // Keep initialized after logout
        });

        return { success: true, redirectTo: "/login" };
      },

      forgotPassword: async (params) => {
        set((state) => ({ loadingStates: { ...state.loadingStates, forgotPassword: true } }));
        try {
          const response = await apiClient.auth.forgotPassword({
            email: params.email,
            redirectTo: `${window.location.origin}/reset-password`,
          });

          set((state) => ({ loadingStates: { ...state.loadingStates, forgotPassword: false } }));

          if (response.success) {
            return { success: true };
          }

          return {
            success: false,
            error: { name: "ForgotPasswordError", message: "Failed to send reset email" },
          };
        } catch (error: unknown) {
          set((state) => ({ loadingStates: { ...state.loadingStates, forgotPassword: false } }));
          return createAuthError(error, "ForgotPasswordError", "Failed to send reset email");
        }
      },

      resetPassword: async (params) => {
        set((state) => ({ loadingStates: { ...state.loadingStates, resetPassword: true } }));
        try {
          const response = await apiClient.auth.resetPassword({
            token: params.token,
            newPassword: params.newPassword,
          });

          set((state) => ({ loadingStates: { ...state.loadingStates, resetPassword: false } }));

          if (response.success) {
            return { success: true, redirectTo: "/login" };
          }

          return {
            success: false,
            error: { name: "ResetPasswordError", message: "Failed to reset password" },
          };
        } catch (error: unknown) {
          set((state) => ({ loadingStates: { ...state.loadingStates, resetPassword: false } }));
          return createAuthError(error, "ResetPasswordError", "Failed to reset password");
        }
      },

      socialLogin: async (provider) => {
        set((state) => ({ loadingStates: { ...state.loadingStates, socialLogin: true } }));
        try {
          const response = await apiClient.auth.signInSocial({
            provider,
            callbackURL: `${window.location.origin}/`,
            newUserCallbackURL: `${window.location.origin}/onboarding`,
            errorCallbackURL: `${window.location.origin}/login?error=social_auth_failed`,
          });

          set((state) => ({ loadingStates: { ...state.loadingStates, socialLogin: false } }));

          // Social auth typically returns a redirect URL for OAuth flow
          if (response.url) {
            return { success: true, redirectUrl: response.url };
          }

          // If no redirect URL, the response might contain user data directly
          if (response.user && response.token) {
            set((state) => ({
              token: response.token,
              user: response.user,
              isAuthenticated: true,
              loadingStates: { ...state.loadingStates, socialLogin: false },
            }));
            return { success: true, redirectUrl: "/" };
          }

          return {
            success: false,
            error: { name: "SocialLoginError", message: "Social login failed" },
          };
        } catch (error: unknown) {
          set((state) => ({ loadingStates: { ...state.loadingStates, socialLogin: false } }));
          const code = getAPIErrorCode(error) || undefined;
          const message = getAPIErrorMessage(error, "Social login failed");
          return {
            success: false,
            error: { name: "SocialLoginError", message, code },
          };
        }
      },
    }),
    {
      name: "brand-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist loadingStates or isInitialized
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, reset loading states
        // isInitialized stays false - will be set after initialize() is called
        if (state) {
          state.loadingStates = {
            login: false,
            register: false,
            logout: false,
            forgotPassword: false,
            resetPassword: false,
            socialLogin: false,
          };
          state.isInitialized = false;
        }
      },
    }
  )
);

// Convenience hooks matching the old API
export function useLogin() {
  const login = useAuthStore((state) => state.login);
  const isPending = useAuthStore((state) => state.loadingStates.login);

  const mutate = async (
    params: LoginParams,
    options?: { onSuccess?: () => void; onError?: (error: { message: string; code?: string }) => void }
  ) => {
    const result = await login(params);
    if (result.success) {
      options?.onSuccess?.();
    } else if (result.error) {
      options?.onError?.({ message: result.error.message, code: result.error.code });
    }
    return result;
  };

  return { mutate, isPending };
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const isPending = useAuthStore((state) => state.loadingStates.logout);

  const mutate = async () => {
    return await logout();
  };

  return { mutate, isPending };
}

export function useRegister() {
  const register = useAuthStore((state) => state.register);
  const isPending = useAuthStore((state) => state.loadingStates.register);

  const mutate = async (
    params: RegisterParams,
    options?: { onSuccess?: () => void; onError?: (error: { message: string; code?: string }) => void }
  ) => {
    const result = await register(params);
    if (result.success) {
      options?.onSuccess?.();
    } else if (result.error) {
      options?.onError?.({ message: result.error.message, code: result.error.code });
    }
    return result;
  };

  return { mutate, isPending };
}

export function useForgotPassword() {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const isPending = useAuthStore((state) => state.loadingStates.forgotPassword);

  const mutate = async (
    params: ForgotPasswordParams,
    options?: { onSuccess?: () => void; onError?: (error: { message: string; code?: string }) => void }
  ) => {
    const result = await forgotPassword(params);
    if (result.success) {
      options?.onSuccess?.();
    } else if (result.error) {
      options?.onError?.({ message: result.error.message, code: result.error.code });
    }
    return result;
  };

  return { mutate, isPending };
}

export function useUpdatePassword() {
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isPending = useAuthStore((state) => state.loadingStates.resetPassword);

  const mutate = async (
    params: ResetPasswordParams,
    options?: { onSuccess?: () => void; onError?: (error: { message: string; code?: string }) => void }
  ) => {
    const result = await resetPassword(params);
    if (result.success) {
      options?.onSuccess?.();
    } else if (result.error) {
      options?.onError?.({ message: result.error.message, code: result.error.code });
    }
    return result;
  };

  return { mutate, isPending };
}

export function useSocialLogin() {
  const socialLogin = useAuthStore((state) => state.socialLogin);
  const isPending = useAuthStore((state) => state.loadingStates.socialLogin);

  const mutate = async (
    provider: SocialProvider,
    options?: { onSuccess?: (redirectUrl?: string) => void; onError?: (error: { message: string; code?: string }) => void }
  ) => {
    const result = await socialLogin(provider);
    if (result.success) {
      options?.onSuccess?.(result.redirectUrl);
    } else if (result.error) {
      options?.onError?.({ message: result.error.message, code: result.error.code });
    }
    return result;
  };

  return { mutate, isPending };
}

// useGetIdentity is now in use-api.ts to access TanStack Query cache for organization data

export function useIsAuthenticated() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return { data: { authenticated: isAuthenticated }, isLoading: false };
}

// Export token getter for API client
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

// Global 401 handler - call this from API client on 401 errors
export async function handleAuthError() {
  // Clear React Query cache
  const { queryClient } = await import("@/App");
  queryClient.clear();

  // Clear auth state
  useAuthStore.getState().clearAuth();
}
