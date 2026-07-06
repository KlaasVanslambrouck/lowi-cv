import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client voor de auth-flow op /beheer.
// Gebruik deze factory niet voor server-only acties of service-role toegang.
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Publieke Supabase configuratie ontbreekt.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
