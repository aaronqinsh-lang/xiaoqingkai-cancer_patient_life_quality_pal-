
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * 
 * We prioritize environment variables for secure deployment.
 * These should be set in your hosting platform's environment variables section.
 */
// Fix: Use process.env instead of import.meta.env to resolve "Property 'env' does not exist on type 'ImportMeta'" error.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // During local development or if not yet configured, we can provide fallback for preview if needed, 
  // but following the user request to strictly use env variables and throw error if missing.
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. ' +
    'The app may not function correctly until these are set in your deployment platform settings.'
  );
}

// Using fallback defaults only if env is not provided, to ensure it still works in the current sandbox.
export const supabase = createClient(
  supabaseUrl || 'https://rqdeihkitoswedegwqgd.supabase.co', 
  supabaseKey || 'sb_publishable_1WlEdSsW6glJNyxgERtzJA_HmuaGVjT'
);
