// src/lib/auth-service.ts - Fixed version
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
      console.log('Checking authentication status...');
      const { data, error } = await supabase.auth.getSession();
      
      const isAuth = !error && !!data?.session;
      console.log('Authentication status:', isAuth ? 'Authenticated' : 'Not authenticated');
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Sign in with email/password
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log(`Attempting sign-in for ${email}`);
      
      // First clear any existing session data to prevent conflicts
      await this.clearAuthState();
      
      // Then sign in with the provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign-in error:', error.message);
        throw error;
      }
      
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
      console.log(`Attempting sign-up for ${email}`);
      
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
      console.error('Sign-up error:', error.message);
      return { user: null, session: null, error: error.message };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      // First sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Then clear all local storage
      await this.clearAuthState();
      
      console.log('Sign-out complete');
      return { error: null };
    } catch (error: any) {
      console.error('Sign-out error:', error.message);
      return { error: error.message };
    }
  }

  static async clearAuthState() {
    // Clear all storage
    if (typeof window !== 'undefined') {
      console.log('Clearing auth state...');
      
      try {
        // Clear the Supabase storage specifically
        localStorage.removeItem('supabase.auth.token');
        
        // For Supabase v2 format
        const storageKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sb-') || key.includes('supabase')
        );
        
        storageKeys.forEach(key => {
          console.log(`Clearing auth data: ${key}`);
          localStorage.removeItem(key);
        });
        
        // You can also try session storage
        if (sessionStorage) {
          const sessionKeys = Object.keys(sessionStorage).filter(key => 
            key.startsWith('sb-') || key.includes('supabase')
          );
          
          sessionKeys.forEach(key => {
            console.log(`Clearing session data: ${key}`);
            sessionStorage.removeItem(key);
          });
        }
        
        console.log('Auth state cleared');
      } catch (err) {
        console.error('Error clearing auth state:', err);
      }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      console.log('Getting current user...');
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data.user) {
        console.log('Current user found:', data.user.id);
      } else {
        console.log('No current user found');
      }
      
      return { user: data.user, session: null, error: null };
    } catch (error: any) {
      console.error('Error getting current user:', error.message);
      return { user: null, session: null, error: error.message };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<ProfileResponse> {
    try {
      console.log(`Getting profile for user ${userId}`);
      
      // First, check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found, will create a default one later');
          // No profile found, return null (will be created later)
          return { profile: null, error: null };
        }
        throw error;
      }
      
      console.log('Profile found');
      return { profile: data, error: null };
    } catch (error: any) {
      console.error('Error getting user profile:', error.message);
      return { profile: null, error: error.message };
    }
  }

  // Create user profile
  static async createProfile(userId: string, userType: string, userData: any): Promise<{ error: string | null }> {
    try {
      console.log(`Creating profile for user ${userId}, type: ${userType}`);
      
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
        
        console.log('Shelter details created');
      }
      
      console.log('Profile created successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error creating profile:', error.message);
      return { error: error.message };
    }
  }
}