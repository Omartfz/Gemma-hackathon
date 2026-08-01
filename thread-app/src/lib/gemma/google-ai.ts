/** Shared Google AI (Gemma) generateContent client. */

export type GoogleGenerateInput = {
  system: string;
  user: string;
  imageBase64?: string;
  mimeType?: string;
  /** Hint JSON-only replies (prompt + optional responseMimeType). */
  json?: boolean;
};

function apiKey(): string {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key?.trim()) {
    throw new Error("GOOGLE_API_KEY / GEMINI_API_KEY is not set");
  }
  return key.trim();
}

/** Default: Gemma 4 MoE on Gemini API (text + image). */
export function gemmaCloudModel(): string {
  return (
    process.env.GEMMA_CLOUD_MODEL?.trim() ||
    process.env.GOOGLE_MODEL?.trim() ||
    "gemma-4-26b-a4b-it"
  );
}

type Part =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

function extractText(data: unknown): string {
  const root = data as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
    }[];
    error?: { message?: string };
  };
  if (root.error?.message) {
    throw new Error(root.error.message);
  }
  const parts = root.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw new Error("Google AI returned empty content");
  }
  return text;
}

async function callGenerateContent(
  key: string,
  model: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { error?: { message?: string } })?.error?.message ||
      `Google AI error ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Call Gemma (or override model) via Generative Language API. */
export async function generateWithGoogle(
  input: GoogleGenerateInput,
): Promise<string> {
  const key = apiKey();
  const model = gemmaCloudModel();

  const parts: Part[] = [
    // Prefix system — some Gemma endpoints ignore system_instruction
    { text: `${input.system}\n\n---\n\n${input.user}` },
  ];
  if (input.imageBase64) {
    const mime = input.mimeType?.startsWith("image/")
      ? input.mimeType
      : "image/png";
    parts.push({
      inline_data: {
        mime_type: mime,
        data: input.imageBase64,
      },
    });
  }

  const baseBody: Record<string, unknown> = {
    system_instruction: {
      parts: [{ text: input.system }],
    },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.2,
    },
  };

  try {
    const body = {
      ...baseBody,
      generationConfig: {
        temperature: 0.2,
        ...(input.json ? { responseMimeType: "application/json" } : {}),
      },
    };
    return extractText(await callGenerateContent(key, model, body));
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (input.json && status === 400) {
      return extractText(await callGenerateContent(key, model, baseBody));
    }
    throw err;
  }
}

export function hasGoogleApiKey(): boolean {
  return Boolean(
    process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim(),
  );
}
