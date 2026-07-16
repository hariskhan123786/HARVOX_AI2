import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[Supabase Setup] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env\n' +
    '                  → Add them to server/.env and restart the server.\n' +
    '                  → See server/.env.example for the full list of required variables.'
  );
}

// Admin client: Bypasses RLS — used for server-side operations (seeding, auth verification, admin routes)
export const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : {
      // Stub that returns graceful errors so the server boots (but all DB calls fail with a clear message)
      from: () => ({ select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        resetPasswordForEmail: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        admin: { updateUserById: () => Promise.resolve({ error: new Error('Supabase not configured') }), deleteUser: () => Promise.resolve({ error: new Error('Supabase not configured') }), listUsers: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) },
      },
      storage: { from: () => ({ upload: () => Promise.resolve({ error: new Error('Supabase not configured') }), getPublicUrl: () => ({ data: { publicUrl: '' } }), createSignedUrl: () => Promise.resolve({ error: new Error('Supabase not configured') }) }) },
    };

// User client factory: Enforces RLS by calling on behalf of the authenticated user token
export const getSupabaseUserClient = (token) => {
  if (!supabaseUrl || !supabaseAnonKey) return supabase; // Return stub
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
