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
  signUp: (email: string, password: string, userType: string, profileData: ProfileData) => Promise<{ user?: User; error?: any }>;
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
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        setUser(data.session.user);
        await fetchUserProfile(data.session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes with proper type declarations
    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
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
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        shelter_details(*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const signUp = async (email: string, password: string, userType: string, profileData: ProfileData) => {
    try {
      setLoading(true);
      
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          user_type: userType,
          full_name: profileData.fullName,
          phone_number: profileData.phoneNumber,
          address: profileData.address
        });

      if (profileError) throw profileError;

      // If shelter, create shelter details
      if (userType === 'shelter') {
        const { error: shelterError } = await supabase
          .from('shelter_details')
          .insert({
            profile_id: authData.user.id,
            shelter_name: profileData.shelterName,
            shelter_type: profileData.shelterType,
            description: profileData.description,
            location: profileData.location,
            website: profileData.website
          });

        if (shelterError) throw shelterError;
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
    await supabase.auth.signOut();
    router.push('/');
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
