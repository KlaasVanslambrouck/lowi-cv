import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/auth/admin";
import {
  MAX_BODY_BYTES,
  byteLength,
  isJsonContentType,
  validateTrackPayload,
  type TrackPayload,
} from "@/lib/analytics/trackValidation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { createCookieSupabaseClient } from "@/lib/supabase/serverClient";

const SESSION_RATE_LIMIT = 30;
const GLOBAL_RATE_LIMIT = 240;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const dynamic = "force-dynamic";

function jsonError(status: number) {
  return NextResponse.json({ ok: false }, { status });
}

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false },
    { status: 405, headers: { Allow: "POST" } },
  );
}

function readContentLength(request: NextRequest): number | null {
  const value = request.headers.get("content-length");
  if (!value) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : -1;
}

type PayloadReadResult =
  | { ok: true; payload: TrackPayload }
  | { ok: false; status: number };

async function readPayload(request: NextRequest): Promise<PayloadReadResult> {
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return { ok: false, status: 415 };
  }

  const contentLength = readContentLength(request);
  if (contentLength === -1 || (contentLength ?? 0) > MAX_BODY_BYTES) {
    return { ok: false, status: contentLength === -1 ? 400 : 413 };
  }

  const rawBody = await request.text();
  if (byteLength(rawBody) > MAX_BODY_BYTES) {
    return { ok: false, status: 413 };
  }

  try {
    const payload = validateTrackPayload(JSON.parse(rawBody));
    return payload ? { ok: true, payload } : { ok: false, status: 400 };
  } catch {
    return { ok: false, status: 400 };
  }
}

async function hasAdminSession() {
  try {
    const supabase = await createCookieSupabaseClient();
    return isAdminAuthorized(supabase);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const payloadResult = await readPayload(request);
  if (!payloadResult.ok) {
    return jsonError(payloadResult.status);
  }

  const { payload } = payloadResult;

  if (await hasAdminSession()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let supabase;
  try {
    supabase = createServiceRoleSupabaseClient();
  } catch {
    return jsonError(500);
  }

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count: sessionCount, error: sessionCountError } = await supabase
    .from("portfolio_analytics")
    .select("*", { count: "exact", head: true })
    .eq("session_id", payload.sessionId)
    .gte("created_at", since);

  if (sessionCountError) {
    return jsonError(500);
  }

  if ((sessionCount ?? 0) >= SESSION_RATE_LIMIT) {
    return jsonError(429);
  }

  // TODO: vervang deze grove globale DB-noodrem door een echte distributed
  // rate limiter voor significante publieke traffic. Zonder IP-opslag blijft
  // dit bewust een totale traffic-cap, geen betrouwbare client-identiteit.
  const { count: globalCount, error: globalCountError } = await supabase
    .from("portfolio_analytics")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);

  if (globalCountError) {
    return jsonError(500);
  }

  if ((globalCount ?? 0) >= GLOBAL_RATE_LIMIT) {
    return jsonError(429);
  }

  const { error: insertError } = await supabase
    .from("portfolio_analytics")
    .insert({
      session_id: payload.sessionId,
      event_type: payload.eventType,
      event_data: payload.eventData,
      referrer: payload.referrer,
      device_type: payload.deviceType,
    });

  if (insertError) {
    return jsonError(500);
  }

  return NextResponse.json({ ok: true });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
