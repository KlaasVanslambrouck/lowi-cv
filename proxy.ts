import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth/admin";

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL("/beheer", request.url));
}

export async function proxy(request: NextRequest) {
  // De neutrale routenaam is GEEN beveiliging: dit is een public repo en de
  // bestandsstructuur is zichtbaar. Alleen de Supabase-auth-check hieronder telt.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return redirectToLogin(request);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const adminAuth = await verifyAdminAuth(supabase);

  if (!adminAuth.ok) {
    return redirectToLogin(request);
  }

  return response;
}

export const config = {
  matcher: ["/beheer/dashboard/:path*"],
};
