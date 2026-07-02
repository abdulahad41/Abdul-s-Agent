import { createClient } from '@supabase/supabase-js';

// Vercel ke Environment Variables se values uthane ke liye
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Agar keys missing hon to build fail na ho, balki warning dikhaye
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL ya Anon Key missing hai yaar! Vercel settings mein check karo.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
