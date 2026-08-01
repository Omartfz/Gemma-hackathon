import { NextResponse } from "next/server";
import { runResearchDocs } from "@/lib/research/research-docs";
import type { ResearchDocsRequest } from "@/lib/types";

export const runtime = "nodejs";

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
  if (typeof raw.appointment_type !== "string" || !raw.appointment_type.trim()) {
    return NextResponse.json(
      { error: "appointment_type is required" },
      { status: 400 },
    );
  }

  const input: ResearchDocsRequest = {
    appointment_type: raw.appointment_type.trim(),
    location: typeof raw.location === "string" ? raw.location : undefined,
    provider_role:
      typeof raw.provider_role === "string" ? raw.provider_role : undefined,
    gestational_week:
      typeof raw.gestational_week === "number"
        ? raw.gestational_week
        : typeof raw.gestational_week === "string" &&
            raw.gestational_week.trim() !== ""
          ? Number(raw.gestational_week)
          : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
  };

  if (
    input.gestational_week !== undefined &&
    Number.isNaN(input.gestational_week)
  ) {
    input.gestational_week = undefined;
  }

  const result = await runResearchDocs(input);
  return NextResponse.json(result);
}
