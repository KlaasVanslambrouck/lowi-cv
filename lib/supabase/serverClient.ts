import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server-side client die de ingelogde Supabase-gebruiker uit cookies leest.
// Deze gebruikt de anon key zodat RLS op dashboard-queries actief blijft.
export async function createCookieSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Publieke Supabase configuratie ontbreekt.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components mogen cookies niet altijd schrijven; lezen blijft genoeg
          // voor dashboardbeveiliging en RLS-selects.
        }
      },
    },
  });
}
