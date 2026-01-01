
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * 
 * We prioritize environment variables but provide the project-specific 
 * credentials as defaults to ensure the app works out-of-the-box in the 
 * preview environment.
 */
const supabaseUrl = (process.env as any).NEXT_PUBLIC_SUPABASE_URL || 'https://rqdeihkitoswedegwqgd.supabase.co';

// The key can be provided under different environment variable names depending on the platform.
const supabaseAnonKey = 
  (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY
  (process.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
