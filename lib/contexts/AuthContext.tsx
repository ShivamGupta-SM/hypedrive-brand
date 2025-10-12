import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { BrandRegistrationSync } from '@/lib/storage/brandRegistration';
import type { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurrentUser, useCurrentSession } from '../query/auth';
import { BrandService } from '../supabase/services/brand';
import type { Brand } from '../supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  brandProfile: Brand | null;
  hasBrandProfile: boolean;
  brandLoading: boolean;
  signOut: () => Promise<void>;
  refreshBrandProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: session, isLoading: sessionLoading } = useCurrentSession();
  const [brandProfile, setBrandProfile] = useState<Brand | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  
  const loading = userLoading || sessionLoading;

  // Fetch brand profile when user is available
  const fetchBrandProfile = async (userId: string) => {
    setBrandLoading(true);
    try {
      const brand = await BrandService.getBrandByUserId(userId);
      setBrandProfile(brand);
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      setBrandProfile(null);
    } finally {
      setBrandLoading(false);
    }
  };

  const refreshBrandProfile = async () => {
    if (user?.id) {
      await fetchBrandProfile(user.id);
    }
  };

  // Fetch brand profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchBrandProfile(user.id);
    } else {
      setBrandProfile(null);
    }
  }, [user?.id]);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            // Store session info for persistence
            if (session) {
              await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
            }
            
            // Check brand registration status
             const isRegistrationComplete = await BrandRegistrationSync.isBrandRegistrationComplete();
             
             if (isRegistrationComplete) {
               // Check approval status from local storage
               const status = await BrandRegistrationSync.getBrandRegistrationStatus();
               
               if (status?.approvalStatus === 'pending') {
                 router.replace('/(brand)/under-review');
               } else if (status?.approvalStatus === 'approved') {
                 router.replace('/(tabs)');
               } else if (status?.approvalStatus === 'rejected') {
                 router.replace('/(brand)/under-review');
               } else {
                 // Fallback to checking server status
                 handleAuthRedirect(session?.user);
               }
             } else {
               // Start brand registration flow
               router.replace('/(brand)/setup');
             }
            break;
            
          case 'SIGNED_OUT':
            // Clear stored session and brand profile
            await AsyncStorage.removeItem('supabase_session');
            setBrandProfile(null);
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
      const brand = await BrandService.getBrandByUserId(user.id);
      
      if (!brand) {
        // No brand profile exists, redirect to brand onboarding
        router.replace('/brand-onboarding');
      } else {
        if (!brand.is_complete) {
          // Brand profile exists but incomplete, redirect to continue setup
          router.replace('/(brand)/setup');
        } else if (brand.approval_status === 'pending') {
          // Brand is complete but pending approval
          router.replace('/(brand)/under-review');
        } else if (brand.approval_status === 'approved') {
          // Brand is approved, redirect to main app
          router.replace('/(tabs)');
        } else {
          // Brand is rejected or other status
          router.replace('/(brand)/under-review');
        }
      }
    } catch (error) {
      console.error('Error in auth redirect:', error);
      // Fallback to brand creation screen
      router.replace('/(brand)/setup');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: user ?? null,
    session: session ?? null,
    loading,
    isAuthenticated: !!user,
    brandProfile,
    hasBrandProfile: !!brandProfile,
    brandLoading,
    signOut: handleSignOut,
    refreshBrandProfile,
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