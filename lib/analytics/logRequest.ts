import "server-only";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { requestObservation } from "./requestObservation";

export async function logRequest(observation: NonNullable<ReturnType<typeof requestObservation>>) {
  try {
    const { error } = await createServiceRoleSupabaseClient().from("portfolio_requests").insert(observation);
    if (error) console.warn("Request analytics write failed", error.code);
  } catch {
    // Fail open; do not log request contents, headers or secrets on failure.
    console.warn("Request analytics unavailable");
  }
}
