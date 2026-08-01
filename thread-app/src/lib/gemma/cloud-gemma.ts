import type { ModelExtractInput } from "./openai";

/**
 * Future Google AI / Gemma cloud client.
 * Not used in Phase 2 — set GOOGLE_API_KEY / GEMINI_API_KEY and wire
 * EXTRACT_CLOUD_PROVIDER=gemma later to swap off OpenAI.
 */
export async function extractWithCloudGemma(
  _input: ModelExtractInput,
): Promise<string> {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Cloud Gemma not configured (GOOGLE_API_KEY / GEMINI_API_KEY missing)",
    );
  }

  throw new Error(
    "Cloud Gemma client is stubbed. Set EXTRACT_CLOUD_PROVIDER=openai for now, or implement Generative Language API call here.",
  );
}
