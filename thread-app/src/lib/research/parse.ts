import { ZONE1_REQUIRED_DOCS } from "@/lib/checklist-zone1";
import {
  generateWithGoogle,
  hasGoogleApiKey,
} from "@/lib/gemma/google-ai";
import type { ResearchDocItem } from "@/lib/types";
import type { TavilyHit } from "./tavily";

const ALLOWED_IDS = new Set(ZONE1_REQUIRED_DOCS.map((d) => d.id));

const STRUCTURE_SYSTEM = `You help pregnant patients prepare paperwork for appointments.
Decision-support only — never diagnose or give medical advice.
Prefer catalog ids when possible: intake, labs, ultrasound, insurance.
You may add at most 2 extra snake_case ids if clearly needed for paperwork (e.g. referral_letter).
Return JSON: { "required": [{ "id", "label", "reason" }] }`;

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parseRequired(content: string): ResearchDocItem[] | null {
  try {
    const parsed = JSON.parse(stripFences(content)) as {
      required?: { id?: string; label?: string; reason?: string }[];
    };
    const items = (parsed.required ?? [])
      .filter((r) => r.id && r.label && r.reason)
      .map((r) => ({
        id: String(r.id),
        label: String(r.label),
        reason: String(r.reason),
      }));

    const known: ResearchDocItem[] = [];
    const extras: ResearchDocItem[] = [];
    for (const item of items) {
      if (ALLOWED_IDS.has(item.id)) known.push(item);
      else extras.push(item);
    }
    return [...known, ...extras.slice(0, 2)];
  } catch {
    return null;
  }
}

function buildUserPrompt(input: {
  appointment_type: string;
  gestational_week?: number;
  provider_role?: string;
  notes?: string;
  hits: TavilyHit[];
}): string {
  const catalog = ZONE1_REQUIRED_DOCS.map(
    (d) => `${d.id}: ${d.label}`,
  ).join("\n");
  const snippets = input.hits
    .map((h, i) => `[${i + 1}] ${h.title}\n${h.url}\n${h.content}`)
    .join("\n\n");

  return `Appointment type: ${input.appointment_type}
Gestational week: ${input.gestational_week ?? "unknown"}
Provider role: ${input.provider_role ?? "unknown"}
Notes: ${input.notes ?? "none"}

Catalog:
${catalog}

Public search snippets:
${snippets || "(none)"}

Return required documents for check-in / visit prep as JSON.`;
}

async function structureWithOpenAI(user: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
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
        { role: "system", content: STRUCTURE_SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

/** Map Tavily snippets → structured required docs (Gemma first, OpenAI fallback). */
export async function structureDocsWithModel(input: {
  appointment_type: string;
  gestational_week?: number;
  provider_role?: string;
  notes?: string;
  hits: TavilyHit[];
}): Promise<ResearchDocItem[] | null> {
  const user = buildUserPrompt(input);

  if (hasGoogleApiKey()) {
    try {
      const content = await generateWithGoogle({
        system: STRUCTURE_SYSTEM,
        user,
        json: true,
      });
      const items = parseRequired(content);
      if (items?.length) return items;
    } catch {
      /* try OpenAI */
    }
  }

  const openaiContent = await structureWithOpenAI(user);
  if (!openaiContent) return null;
  return parseRequired(openaiContent);
}

/** @deprecated Use structureDocsWithModel */
export const structureDocsWithOpenAI = structureDocsWithModel;
