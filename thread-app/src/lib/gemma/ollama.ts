import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "./prompt";
import type { ModelExtractInput } from "./openai";

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

/** Local Gemma 4 via Ollama (gemma4:e2b). Throws if Ollama is down. */
export async function extractWithOllama(
  input: ModelExtractInput,
): Promise<string> {
  const model = process.env.OLLAMA_MODEL || "gemma4:e2b";
  const userText = buildExtractUserPrompt(input);

  type Message = {
    role: string;
    content: string;
    images?: string[];
  };

  const message: Message = {
    role: "user",
    content: userText,
  };

  if (input.imageBase64 && input.mimeType?.startsWith("image/")) {
    message.images = [input.imageBase64];
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: EXTRACT_SYSTEM_PROMPT },
        message,
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    message?: { content?: string };
  };
  const content = data.message?.content;
  if (!content) {
    throw new Error("Ollama returned empty content");
  }
  return content;
}
