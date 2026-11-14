import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 10
);

if (!isSupabaseConfigured) {
  console.info(
    '[Skillpath Supabase] Supabase credentials not detected or incomplete. Running in client-side mode with local persistence. To connect your Supabase project, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env'
  );
}

// Fallback dummy URL and anon key to prevent createClient initialization crash when unconfigured
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://dummy-project.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key-placeholder-skillpath';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

