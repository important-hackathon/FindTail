// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth-service';
import { supabase } from '@/lib/supabase/client'; // Add this import

interface ProfileData {
  fullName: string;
  phoneNumber?: string;
  address?: string;
  shelterName?: string;
  shelterType?: string;
  description?: string;
  location?: string;
  website?: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: string, userData: ProfileData) => Promise<{ user?: User; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: any }>;
  signOut: () => Promise<void>;
  isVolunteer: boolean;
  isShelter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session and load user data
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if authenticated
        const isAuthenticated = await AuthService.isAuthenticated();
        
        if (isAuthenticated) {
          // Get current user
          const { user: currentUser, error: userError } = await AuthService.getCurrentUser();
          
          if (userError || !currentUser) {
            console.error('Error getting current user:', userError);
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          
          setUser(currentUser);
          
          // Get user profile
          const { profile: userProfile, error: profileError } = await AuthService.getUserProfile(currentUser.id);
          
          if (profileError) {
            console.error('Error getting user profile:', profileError);
          } else if (!userProfile) {
            // Create default profile if none exists
            await AuthService.createProfile(
              currentUser.id, 
              'volunteer', // Default type 
              { fullName: currentUser.email?.split('@')[0] || 'User' }
            );
            
            // Fetch the newly created profile
            const { profile: newProfile } = await AuthService.getUserProfile(currentUser.id);
            setProfile(newProfile);
          } else {
            // If it's a shelter type, handle shelter details
            if (userProfile.user_type === 'shelter') {
              // Check if shelter_details exists
              const { data: shelterData } = await supabase
                .from('shelter_details')
                .select('*')
                .eq('profile_id', currentUser.id);
                
              if (shelterData && shelterData.length > 0) {
                setProfile({
                  ...userProfile,
                  shelter_details: shelterData[0]
                });
              } else {
                setProfile(userProfile);
              }
            } else {
              setProfile(userProfile);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Add Supabase auth change listener with proper type annotations
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          try {
            const { profile: userProfile } = await AuthService.getUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (err) {
            console.error('Profile fetch error during auth change:', err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Return cleanup function
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userType: string, userData: ProfileData) => {
    try {
      setLoading(true);
      
      const { user: authUser, error } = await AuthService.signUp(email, password, userType, userData);
      
      if (error) throw new Error(error);
      
      // Return in the expected format
      return { user: authUser || undefined };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { user: authUser, error } = await AuthService.signIn(email, password);
      
      if (error) throw new Error(error);
      if (!authUser) throw new Error('No user returned from sign in');
      
      // Return in the expected format
      return { user: authUser };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      // Immediately set user and profile to null
      setUser(null);
      setProfile(null);
      
      // Force a navigation to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isVolunteer: profile?.user_type === 'volunteer',
    isShelter: profile?.user_type === 'shelter',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};