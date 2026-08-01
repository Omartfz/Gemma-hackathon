import { NextResponse } from "next/server";
import { runReadiness } from "@/lib/agent/run-readiness";
import type { AppState } from "@/lib/types";

export const runtime = "nodejs";

function looksLikeState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.appointments) &&
    Array.isArray(o.documents) &&
    Array.isArray(o.entries)
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  if (typeof raw.appointment_id !== "string" || !raw.appointment_id.trim()) {
    return NextResponse.json(
      { error: "appointment_id is required" },
      { status: 400 },
    );
  }
  if (!looksLikeState(raw.state)) {
    return NextResponse.json(
      { error: "state with appointments, documents, and entries is required" },
      { status: 400 },
    );
  }

  try {
    const result = await runReadiness(raw.state, raw.appointment_id.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Readiness failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
