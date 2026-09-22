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
import { classifyUserAgent } from "@/lib/analytics/classify";
import { coarseGeography } from "@/lib/analytics/requestObservation";

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
  const origin = request.headers.get("origin");
  if ((origin && origin !== request.nextUrl.origin) || request.headers.get("sec-fetch-site") === "cross-site") return jsonError(403);
  const payloadResult = await readPayload(request);
  if (!payloadResult.ok) {
    return jsonError(payloadResult.status);
  }

  const { payload } = payloadResult;

  const isAdmin = await hasAdminSession();

  let supabase;
  try {
    supabase = createServiceRoleSupabaseClient();
  } catch {
    return jsonError(500);
  }

  const classification = classifyUserAgent(request.headers.get("user-agent"), payload.signals?.webdriver);
  const isInternal = isAdmin || payload.session?.is_internal === true;
  const { data: stored, error: insertError } = await supabase.rpc("record_portfolio_event", {
    p_event: {
      id: payload.eventId ?? crypto.randomUUID(),
      session_id: payload.sessionId,
      event_type: payload.eventType,
      event_data: payload.eventData,
      referrer: payload.referrer,
      device_type: payload.deviceType,
      path: payload.path ?? null,
    },
    p_session: {
      ...payload.session,
      is_internal: isInternal,
      ...classification,
      ...coarseGeography(request.headers, process.env.VERCEL === "1"),
      signals: payload.signals ?? {},
    },
  });

  if (insertError) {
    return jsonError(500);
  }

  if (stored?.rate_limited) return jsonError(429);
  return NextResponse.json({ ok: true, humanContextAllowed: stored?.human_context_allowed === true });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
