import { NextRequest, NextResponse } from "next/server";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

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

export async function POST(request: NextRequest) {
  const clientIp = readClientIp(request);
  const now = Date.now();
  const current = attemptsByIp.get(clientIp);

  // TODO: deze in-memory teller reset bij serverless cold starts. Dat is geen
  // waterdichte brute-forcebescherming, maar wel een eenvoudige basisdrempel.
  if (!current || current.resetAt <= now) {
    attemptsByIp.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.json({ ok: true });
  }

  if (current.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  attemptsByIp.set(clientIp, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });

  return NextResponse.json({ ok: true });
}
