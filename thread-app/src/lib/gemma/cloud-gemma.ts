import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "./prompt";
import { generateWithGoogle } from "./google-ai";
import type { ModelExtractInput } from "./openai";

/** Cloud Gemma via Google AI Generative Language API. */
export async function extractWithCloudGemma(
  input: ModelExtractInput,
): Promise<string> {
  return generateWithGoogle({
    system: EXTRACT_SYSTEM_PROMPT,
    user: buildExtractUserPrompt(input),
    imageBase64: input.imageBase64,
    mimeType: input.mimeType,
    json: true,
  });
}
