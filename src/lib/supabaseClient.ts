import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create client instance. Vite automatically loads variables starting with VITE_
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
