import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabasePublicKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
