import { createClient } from '@supabase/supabase-js';

// Environment variables uthane ke liye
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Agar keys na hon to fake dummy keys use karein taake client-side exception na aaye
const finalUrl = supabaseUrl || 'https://placeholder-url.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);
