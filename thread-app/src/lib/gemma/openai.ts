import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "./prompt";

export type ModelExtractInput = {
  filename: string;
  mimeType?: string;
  textHint?: string;
  imageBase64?: string;
};

/** Temporary cloud path until Gemma API keys are available. */
export async function extractWithOpenAI(
  input: ModelExtractInput,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const userText = buildExtractUserPrompt(input);

  type ContentPart =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } };

  const userContent: ContentPart[] = [{ type: "text", text: userText }];

  // Vision only for real images — PDFs are converted to textHint upstream.
  if (input.imageBase64 && input.mimeType?.startsWith("image/")) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${input.mimeType};base64,${input.imageBase64}`,
      },
    });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACT_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }
  return content;
}
