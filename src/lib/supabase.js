import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && 
                   supabaseUrl !== 'your_supabase_url' && 
                   supabaseAnonKey && 
                   supabaseAnonKey !== 'your_supabase_anon_key';

if (!isConfigured) {
  console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your frontend/.env file.');
} else {
  console.log('Supabase client initialized with URL:', supabaseUrl);
}

// Create client only if configured, or use dummy values to prevent crash during dev
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-key'
);
