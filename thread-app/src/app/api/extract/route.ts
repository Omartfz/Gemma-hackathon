import { NextResponse } from "next/server";
import { runExtract } from "@/lib/gemma/extract";
import type { ExtractRequest, GemmaMode } from "@/lib/types";

export const runtime = "nodejs";

function isMode(value: unknown): value is GemmaMode {
  return value === "local" || value === "cloud";
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
  if (typeof raw.filename !== "string" || !raw.filename.trim()) {
    return NextResponse.json(
      { error: "filename is required" },
      { status: 400 },
    );
  }

  const input: ExtractRequest = {
    filename: raw.filename.trim(),
    mode: isMode(raw.mode) ? raw.mode : "cloud",
    mimeType: typeof raw.mimeType === "string" ? raw.mimeType : undefined,
    textHint: typeof raw.textHint === "string" ? raw.textHint : undefined,
    imageBase64:
      typeof raw.imageBase64 === "string" ? raw.imageBase64 : undefined,
  };

  const result = await runExtract(input);
  return NextResponse.json(result);
}
