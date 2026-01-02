
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * 
 * We prioritize environment variables for secure deployment.
 * These should be set in your hosting platform's environment variables section.
 */

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. ' +
      'Set them in Netlify (Site settings → Build & deploy → Environment → Environment variables).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
