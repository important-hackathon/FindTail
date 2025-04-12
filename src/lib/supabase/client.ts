import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are properly accessed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if the environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

// Create the Supabase client with proper error handling
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      // Increase timeout for better reliability on initial loads
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      // Increase timeouts for better reliability on slower connections
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // 30 second timeout
          signal: options?.signal || (new AbortController().signal)
        });
      }
    }
  }
);

// Helper function to ensure Supabase is ready
export const ensureSupabaseIsReady = async () => {
  // Check if Supabase client is properly initialized
  try {
    // Simple query to test connection
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error initializing Supabase:', err);
    return false;
  }
};