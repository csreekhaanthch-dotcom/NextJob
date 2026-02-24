// lib/supabase.ts

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This function creates the Supabase client.
// The 'export' keyword makes it available for other files to import.
export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};