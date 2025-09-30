import { supabase } from '../client';
import type { User } from '../types';

export class AuthService {
  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Get the current session
   */
  static async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      return null;
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in signOut:', error);
      return false;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in signInWithEmail:', error);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in signUpWithEmail:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('Error sending reset password email:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }

  /**
   * Update user metadata
   */
  static async updateUserMetadata(metadata: Record<string, any>) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        console.error('Error updating user metadata:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserMetadata:', error);
      throw error;
    }
  }
}