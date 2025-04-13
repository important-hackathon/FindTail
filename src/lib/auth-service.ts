// src/lib/auth-service.ts
import { supabase } from './supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

interface ProfileResponse {
  profile: any | null;
  error: string | null;
}

export class AuthService {
  // Check if user is currently authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return !error && !!data?.session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Sign in with email/password
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log(`Attempting sign-in for ${email}`);
      
      // First sign out to clear any existing sessions
      await this.signOut();
      
      // Then sign in with the provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Sign-in successful, session established:', !!data?.session);
      
      // Return the user and session
      return {
        user: data.user,
        session: data.session,
        error: null
      };
    } catch (error: any) {
      console.error('Sign-in error:', error.message);
      return { user: null, session: null, error: error.message };
    }
  }

  // Sign up
  static async signUp(email: string, password: string, userType: string, userData: any): Promise<AuthResponse> {
    try {
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign up');
      
      // Create profile
      const { error: profileError } = await this.createProfile(data.user.id, userType, userData);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway - we'll handle this in fetchUserProfile
      }
      
      return { 
        user: data.user, 
        session: data.session,
        error: null 
      };
    } catch (error: any) {
      return { user: null, session: null, error: error.message };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      await supabase.auth.signOut();
      await this.clearAuthState();
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  static async clearAuthState() {
    // Clear all storage
    if (typeof window !== 'undefined') {
      // For Supabase v2 format
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      );
      
      storageKeys.forEach(key => {
        console.log(`Clearing auth data: ${key}`);
        localStorage.removeItem(key);
      });
      
      // You can also try session storage
      const sessionKeys = Object.keys(sessionStorage || {}).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      );
      
      sessionKeys.forEach(key => {
        console.log(`Clearing session data: ${key}`);
        sessionStorage?.removeItem(key);
      });
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, session: null, error: null };
    } catch (error: any) {
      return { user: null, session: null, error: error.message };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<ProfileResponse> {
    try {
      // First, check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, return null (will be created later)
          return { profile: null, error: null };
        }
        throw error;
      }
      
      return { profile: data, error: null };
    } catch (error: any) {
      return { profile: null, error: error.message };
    }
  }

  // Create user profile
  static async createProfile(userId: string, userType: string, userData: any): Promise<{ error: string | null }> {
    try {
      // Create basic profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: userType,
          full_name: userType === 'shelter' ? userData.shelterName : userData.fullName,
          phone_number: userData.phoneNumber || null,
          address: userType === 'shelter' ? userData.location : userData.address,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // If shelter, create shelter details
      if (userType === 'shelter') {
        const { error: shelterError } = await supabase
          .from('shelter_details')
          .insert({
            profile_id: userId,
            shelter_name: userData.shelterName || userData.fullName || 'New Shelter',
            shelter_type: userData.shelterType || 'animal_shelter',
            description: userData.description || 'A new animal shelter on FindTail',
            location: userData.location || userData.address || 'Ukraine',
            website: userData.website || ''
          });
        
        if (shelterError) throw shelterError;
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}