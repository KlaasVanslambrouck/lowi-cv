import "server-only";

import { createClient } from "@supabase/supabase-js";

// Server-only service-role client voor API-routes die anonieme analytics schrijven.
// NOOIT importeren in client components: deze key omzeilt RLS en hoort enkel op de server.
export function createServiceRoleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service-role configuratie ontbreekt.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
