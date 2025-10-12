import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { Platform } from 'react-native';

// Web-compatible storage for AsyncStorage
const createWebStorage = () => {
  return {
    getItem: (key: string) => {
      if (typeof window !== 'undefined') {
        return Promise.resolve(window.localStorage.getItem(key));
      }
      return Promise.resolve(null);
    },
    setItem: (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    },
  };
};

// Use appropriate storage based on platform
const storage = Platform.OS === 'web' ? createWebStorage() : AsyncStorage;

// Environment variables validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublicKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY are set.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid EXPO_PUBLIC_SUPABASE_URL format: ${supabaseUrl}. Please provide a valid URL.`
  );
}

// Create Supabase client with comprehensive configuration
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabasePublicKey,
  {
    auth: {
      storage: storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
      flowType: 'pkce', // Use PKCE flow for better security
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'hypedrive-brand-app',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// =========================
// AUTH HELPER FUNCTIONS
// =========================

/**
 * Get the current authenticated user
 * @returns Promise<User | null>
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error.message);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
};

/**
 * Get the current session
 * @returns Promise<Session | null>
 */
export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current session:', error.message);
      throw error;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get current session:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns Promise<void>
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns Promise<boolean>
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Get user's custom claims from JWT
 * @returns Promise<any>
 */
export const getUserClaims = async () => {
  try {
    const session = await getCurrentSession();
    if (!session?.access_token) return null;
    
    // Decode JWT to get custom claims
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    return payload.user_metadata || {};
  } catch (error) {
    console.error('Error getting user claims:', error);
    return null;
  }
};

// =========================
// DATABASE HELPER FUNCTIONS
// =========================

/**
 * Execute a database query with error handling
 * @param queryFn - Function that returns a Supabase query
 * @returns Promise with standardized response format
 */
export const executeQuery = async <T>(
  queryFn: () => any
): Promise<{ data: T | null; error: string | null; success: boolean }> => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      console.error('Database query error:', result.error);
      return {
        data: null,
        error: result.error.message || 'Database query failed',
        success: false,
      };
    }
    
    return {
      data: result.data,
      error: null,
      success: true,
    };
  } catch (error: any) {
    console.error('Query execution failed:', error);
    return {
      data: null,
      error: error.message || 'Unknown error occurred',
      success: false,
    };
  }
};

/**
 * Handle real-time subscriptions with error handling
 * @param table - Table name to subscribe to
 * @param callback - Callback function for real-time updates
 * @param filter - Optional filter for the subscription
 * @returns Subscription object
 */
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in ${table} subscription callback:`, error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to ${table} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table} changes`);
      }
    });

  return channel;
};

export default supabase;