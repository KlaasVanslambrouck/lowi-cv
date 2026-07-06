import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

// Enige geldige beheerder voor deze portfolio-omgeving.
// Een user-id is geen geheim; dit is configuratie voor expliciete autorisatie.
export const ADMIN_USER_ID = "b35fbaec-6bd9-4425-9193-e840dfe19eee";

type AdminAuthClient = Pick<SupabaseClient, "auth">;

export type AdminAuthFailureReason =
  | "auth_error"
  | "unauthenticated"
  | "not_admin";

export type AdminAuthResult =
  | {
      ok: true;
      user: User;
      userId: string;
    }
  | {
      ok: false;
      reason: AdminAuthFailureReason;
      message?: string;
    };

export function isConfiguredAdminUserId(
  userId: string | null | undefined,
): userId is typeof ADMIN_USER_ID {
  return userId === ADMIN_USER_ID;
}

export async function verifyAdminAuth(
  supabase: AdminAuthClient,
): Promise<AdminAuthResult> {
  // De neutrale routenaam (/beheer) is geen security boundary: routes,
  // bestandsnamen en clientbundles zijn in een public app nooit geheim.
  //
  // De echte security boundary is tweeledig:
  // 1. Supabase verifieert server-side de sessie met auth.getUser().
  // 2. Deze app autoriseert daarna expliciet alleen de geconfigureerde admin-id.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { ok: false, reason: "auth_error", message: error.message };
  }

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  if (!isConfiguredAdminUserId(user.id)) {
    return { ok: false, reason: "not_admin" };
  }

  return { ok: true, user, userId: user.id };
}

export async function isAdminAuthorized(
  supabase: AdminAuthClient,
): Promise<boolean> {
  return (await verifyAdminAuth(supabase)).ok;
}
