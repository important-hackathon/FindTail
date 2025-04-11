'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

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
    // Check active session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          setUser(data.session.user);
          // Try to fetch profile, but don't block on failure
          await fetchUserProfile(data.session.user.id);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
        if (session?.user) {
          try {
            await fetchUserProfile(session.user.id);
          } catch (err) {
            console.error('Profile fetch error during auth change:', err);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Return cleanup function
    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First, try to fetch just the profile without nested queries
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If there's an error, create a minimal profile as fallback
        const userType = await determineUserType(userId);
        setProfile({
          id: userId,
          user_type: userType || 'volunteer', // Default to volunteer if unknown
          full_name: 'User', // Default name
          // Add other required fields with defaults
        });
        return;
      }

      // If we successfully got the profile, check if it's a shelter
      if (data && data.user_type === 'shelter') {
        try {
          // Fetch shelter details separately
          const { data: shelterData, error: shelterError } = await supabase
            .from('shelter_details')
            .select('*')
            .eq('profile_id', userId)
            .single();
            
          if (!shelterError && shelterData) {
            // Combine the data
            setProfile({
              ...data,
              shelter_details: shelterData
            });
            return;
          }
        } catch (shelterErr) {
          console.error('Error fetching shelter details:', shelterErr);
        }
      }
      
      // If we're here, either it's not a shelter or we couldn't get shelter details
      setProfile(data);
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
      // Set a minimal profile as fallback
      setProfile({
        id: userId,
        user_type: 'unknown'
      });
    }
  };

  // Helper to determine user type if profile fetch fails
  const determineUserType = async (userId: string) => {
    try {
      // Try to check if there's a shelter_details entry
      const { data, error } = await supabase
        .from('shelter_details')
        .select('profile_id')
        .eq('profile_id', userId);
        
      if (!error && data && data.length > 0) {
        return 'shelter';
      }
      
      return 'volunteer'; // Default if no shelter details found
    } catch (err) {
      console.error('Error determining user type:', err);
      return null;
    }
  };

  const signUp = async (email: string, password: string, userType: string, userData: ProfileData) => {
    try {
      setLoading(true);
      
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      // Add delay before creating profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userType,
            full_name: userData.fullName,
            phone_number: userData.phoneNumber || null,
            address: userData.address || null
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue execution - confirmation email was sent
        }

        // If shelter, try to create shelter details
        if (userType === 'shelter') {
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { error: shelterError } = await supabase
              .from('shelter_details')
              .insert({
                profile_id: authData.user.id,
                shelter_name: userData.shelterName || userData.fullName || 'New Shelter',
                shelter_type: userData.shelterType || 'animal_shelter',
                description: userData.description || '',
                location: userData.location || userData.address || '',
                website: userData.website || ''
              });

            if (shelterError) {
              console.error('Shelter details creation error:', shelterError);
              // Don't stop execution due to error
            }
          } catch (err) {
            console.error('Error with shelter details:', err);
            // Ignore error - user can add details later
          }
        }
      } catch (err) {
        console.error('Profile setup error:', err);
        // Even if profile creation fails, 
        // user is registered and can set up profile later
      }

      return { user: authData.user };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');
      
      return { user: data.user };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
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