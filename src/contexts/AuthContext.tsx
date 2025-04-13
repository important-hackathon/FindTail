'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { fixMissingShelterDetails } from '@/lib/helpers';

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
            // Fix missing shelter details if needed
            // await fixMissingShelterDetails();
            
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
      // First, check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      // If no profile found, create one
      if (error && error.code === 'PGRST116') {
        console.log('No profile found, creating one for user:', userId);
        
        // Get email from auth user to use in profile
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData?.user?.email || '';
        
        // Create basic profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            user_type: 'volunteer', // Default to volunteer until we know better
            full_name: userEmail.split('@')[0] || 'New User',
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Failed to create profile:', createError);
          setProfile({
            id: userId,
            user_type: 'volunteer',
            full_name: 'User'
          });
          return;
        }
        
        // Use the newly created profile
        setProfile(newProfile);
        return;
      }
      
      if (error) {
        console.error('Other profile error:', error);
        setProfile({
          id: userId,
          user_type: 'volunteer',
          full_name: 'User'
        });
        return;
      }
  
      // If it's a shelter type, handle shelter details
      if (data && data.user_type === 'shelter') {
        // Check if shelter_details exists
        const { data: shelterData, error: shelterError } = await supabase
          .from('shelter_details')
          .select('*')
          .eq('profile_id', userId);
          
        // If shelter details don't exist yet, create them
        if (!shelterData || shelterData.length === 0) {
          // Create basic shelter details
          const { data: newShelterData, error: createError } = await supabase
            .from('shelter_details')
            .insert({
              profile_id: userId,
              shelter_name: data.full_name || 'New Shelter',
              shelter_type: 'animal_shelter',
              description: 'New shelter on FindTail platform',
              location: data.address || 'Unknown Location',
              website: ''
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating shelter details:', createError);
            // Still set the profile without shelter details
            setProfile(data);
          } else {
            // Set profile with newly created shelter details
            setProfile({
              ...data,
              shelter_details: newShelterData
            });
          }
        } else {
          // Set profile with existing shelter details
          setProfile({
            ...data,
            shelter_details: shelterData[0]
          });
        }
      } else {
        // Not a shelter, just set the profile
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
      setProfile({
        id: userId,
        user_type: 'volunteer',
        full_name: 'User'
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
  
      // Create profile first
      const profileData = {
        id: authData.user.id,
        user_type: userType,
        full_name: userType === 'shelter' ? userData.shelterName : userData.fullName,
        phone_number: userData.phoneNumber || null,
        address: userType === 'shelter' ? userData.location : userData.address,
        created_at: new Date().toISOString()
      };
  
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);
  
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway - we'll handle this in fetchUserProfile
      }
  
    // If shelter, create shelter details
    if (userType === 'shelter') {
      try {
        // Wait for this to complete (use await)
        const { error: shelterError } = await supabase
          .from('shelter_details')
          .insert({
            profile_id: authData.user.id,
            shelter_name: userData.shelterName || userData.fullName || 'New Shelter',
            shelter_type: userData.shelterType || 'animal_shelter',
            description: userData.description || 'A new animal shelter on FindTail',
            location: userData.location || userData.address || 'Ukraine',
            website: userData.website || ''
          });

        if (shelterError) {
          console.error('Shelter details creation error:', shelterError);
          // Try again with simplified data if it failed
          await supabase
            .from('shelter_details')
            .insert({
              profile_id: authData.user.id,
              shelter_name: userData.fullName || 'New Shelter'
            });
        }
      } catch (err) {
        console.error('Failed to create shelter details:', err);
      }
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