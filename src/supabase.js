import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Substitua estas credenciais pelas suas!
// Obtenha em: https://supabase.com/dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);