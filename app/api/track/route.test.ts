import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), admin: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServiceRoleSupabaseClient: () => ({ rpc: mocks.rpc, from: mocks.from }) }));
vi.mock("@/lib/supabase/serverClient", () => ({ createCookieSupabaseClient: async () => ({}) }));
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthorized: mocks.admin }));
import { GET, POST } from "./route";

const event = { sessionId: "123e4567-e89b-42d3-a456-426614174000", eventId: "123e4567-e89b-42d3-a456-426614174001", eventType: "section_view", eventData: { sectionId: "hero" } };
function request(body: unknown = event, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/track", { method: "POST", headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0 Chrome/140", ...headers }, body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.admin.mockResolvedValue(false);
  mocks.rpc.mockResolvedValue({ data: { human_context_allowed: true }, error: null });
  const query = { select: vi.fn(), eq: vi.fn(), gte: vi.fn().mockResolvedValue({ count: 0, error: null }) };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
});

describe("tracking API trust boundary", () => {
  it("keeps legacy events working through a transactional server write", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("record_portfolio_event", expect.objectContaining({ p_event: expect.objectContaining({ id: event.eventId, session_id: event.sessionId }), p_session: expect.objectContaining({ confidence: "inferred", automation_type: "human_candidate" }) }));
  });
  it("marks authenticated admin activity internal instead of discarding it", async () => {
    mocks.admin.mockResolvedValue(true);
    await POST(request());
    expect(mocks.rpc.mock.calls[0][1].p_session.is_internal).toBe(true);
  });
  it("classifies the server-observed UA, never a supplied provider", async () => {
    await POST(request(event, { "user-agent": "Claude-User/1.0" }));
    expect(mocks.rpc.mock.calls[0][1].p_session).toMatchObject({ provider: "anthropic", automation_type: "ai_user_fetch", confidence: "declared" });
    expect((await POST(request({ ...event, provider: "openai" }))).status).toBe(400);
  });
  it("rejects cross-site submissions before writing", async () => {
    expect((await POST(request(event, { origin: "https://other.test" }))).status).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("returns errors for oversized and wrongly typed bodies", async () => {
    expect((await POST(request(event, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(request(event, { "content-length": "5000" }))).status).toBe(413);
    expect((await GET()).status).toBe(405);
  });
  it("propagates sticky session exclusion and handles write failures", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { human_context_allowed: false }, error: null });
    expect(await (await POST(request())).json()).toEqual({ ok: true, humanContextAllowed: false });
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { code: "failure" } });
    expect((await POST(request())).status).toBe(500);
    mocks.rpc.mockResolvedValueOnce({ data: { rate_limited: true }, error: null });
    expect((await POST(request())).status).toBe(429);
  });
});
