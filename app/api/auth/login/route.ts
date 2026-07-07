import { NextRequest, NextResponse } from "next/server";
import { createCookieSupabaseClient } from "@/lib/supabase/serverClient";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
// Ruim boven elke legitieme e-mail/wachtwoordlengte; voorkomt oversized bodies.
const MAX_CREDENTIAL_LENGTH = 512;

interface AttemptWindow {
  count: number;
  resetAt: number;
}

const attemptsByIp = new Map<string, AttemptWindow>();

function readClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

// TODO: deze in-memory teller reset bij serverless cold starts. Dat is geen
// waterdichte brute-forcebescherming, maar wel een eenvoudige basisdrempel.
// Omdat de teller nu in dezelfde route zit als de echte signInWithPassword-call
// is hij niet meer te omzeilen door het formulier over te slaan.
function registerAttempt(clientIp: string): boolean {
  const now = Date.now();
  const current = attemptsByIp.get(clientIp);

  if (!current || current.resetAt <= now) {
    attemptsByIp.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_ATTEMPTS) {
    return false;
  }

  attemptsByIp.set(clientIp, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });
  return true;
}

// Bewust generiek: nooit Supabase-foutdetails of accountinformatie doorsturen.
function genericError(status: number) {
  return NextResponse.json({ ok: false, error: "generic" }, { status });
}

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "generic" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

function readCredential(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value ||
    value.length > MAX_CREDENTIAL_LENGTH
  ) {
    return null;
  }
  return value;
}

export async function POST(request: NextRequest) {
  // De teller loopt op vóór de credentials worden aangeraakt, zodat ook
  // misvormde requests meetellen als poging.
  if (!registerAttempt(readClientIp(request))) {
    return genericError(429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return genericError(400);
  }

  if (typeof body !== "object" || body === null) {
    return genericError(400);
  }

  const email = readCredential((body as Record<string, unknown>).email);
  const password = readCredential((body as Record<string, unknown>).password);
  if (!email || !password) {
    return genericError(400);
  }

  let supabase;
  try {
    supabase = await createCookieSupabaseClient();
  } catch {
    return genericError(500);
  }

  // Server-side login: de cookie-adapter van createCookieSupabaseClient
  // schrijft de sessie-cookies op de response, dus de browser stuurt ze
  // automatisch mee bij volgende requests naar /beheer/dashboard.
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return genericError(401);
  }

  return NextResponse.json({ ok: true });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
