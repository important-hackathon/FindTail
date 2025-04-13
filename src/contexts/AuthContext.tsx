// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth-service';
import { supabase } from '@/lib/supabase/client';

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
  const [authInitialized, setAuthInitialized] = useState(false);
  const router = useRouter();

  // Prevent race conditions by using a single initialization flow
  useEffect(() => {
    if (authInitialized) return;

    // Create a flag to prevent state updates after component unmount
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth context...');
        
        // Check if authenticated
        const isAuthenticated = await AuthService.isAuthenticated();
        console.log('Authentication check result:', isAuthenticated);
        
        if (isAuthenticated) {
          // Get current user
          const { user: currentUser, error: userError } = await AuthService.getCurrentUser();
          
          if (userError || !currentUser) {
            console.error('Error getting current user:', userError);
            if (isMounted) {
              setUser(null);
              setProfile(null);
            }
          } else {
            // Set user if component is still mounted
            if (isMounted) {
              setUser(currentUser);
            }
            
            // Get user profile
            try {
              const { profile: userProfile, error: profileError } = await AuthService.getUserProfile(currentUser.id);
              
              if (profileError) {
                console.error('Error getting user profile:', profileError);
                if (isMounted) setProfile(null);
              } else if (!userProfile) {
                // Create default profile if none exists
                await AuthService.createProfile(
                  currentUser.id, 
                  'volunteer', // Default type 
                  { fullName: currentUser.email?.split('@')[0] || 'User' }
                );
                
                // Fetch the newly created profile
                const { profile: newProfile } = await AuthService.getUserProfile(currentUser.id);
                if (isMounted) setProfile(newProfile);
              } else {
                // If it's a shelter type, handle shelter details
                if (userProfile.user_type === 'shelter') {
                  try {
                    // Check if shelter_details exists
                    const { data: shelterData } = await supabase
                      .from('shelter_details')
                      .select('*')
                      .eq('profile_id', currentUser.id);
                      
                    if (shelterData && shelterData.length > 0 && isMounted) {
                      setProfile({
                        ...userProfile,
                        shelter_details: shelterData[0]
                      });
                    } else if (isMounted) {
                      setProfile(userProfile);
                    }
                  } catch (shelterError) {
                    console.error('Error fetching shelter details:', shelterError);
                    if (isMounted) setProfile(userProfile);
                  }
                } else if (isMounted) {
                  setProfile(userProfile);
                }
              }
            } catch (profileError) {
              console.error('Error in profile handling:', profileError);
              if (isMounted) setProfile(null);
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthInitialized(true);
          console.log('Auth initialization complete');
        }
      }
    };

    initializeAuth();

    // Add Supabase auth change listener with proper type annotations
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event);
        
        if (isMounted) {
          setUser(session?.user || null);
        }
        
        if (session?.user) {
          try {
            const { profile: userProfile } = await AuthService.getUserProfile(session.user.id);
            if (isMounted) {
              setProfile(userProfile);
            }
          } catch (err) {
            console.error('Profile fetch error during auth change:', err);
            if (isMounted) {
              setProfile(null);
            }
          }
        } else if (isMounted) {
          setProfile(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Return cleanup function
    return () => {
      console.log('Cleaning up auth context');
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [authInitialized]);

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
      
      // First ensure we're fully logged out to prevent session conflicts
      await AuthService.signOut();
      
      const { user: authUser, error } = await AuthService.signIn(email, password);
      
      if (error) throw new Error(error);
      if (!authUser) throw new Error('No user returned from sign in');
      
      // Manually update local state
      setUser(authUser);
      
      try {
        // Fetch profile immediately to ensure we have it
        const { profile: userProfile } = await AuthService.getUserProfile(authUser.id);
        setProfile(userProfile);
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
        // Continue without profile - it will be loaded during context initialization
      }
      
      // Return in the expected format
      return { user: authUser };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // First clear our state
      setUser(null);
      setProfile(null);
      
      // Then sign out properly
      await AuthService.signOut();
      
      // Force a full context reinitialization
      setAuthInitialized(false);
      
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