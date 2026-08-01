import type { DocFlag, ExtractResult, TimelineEntry } from "@/lib/types";

const ENTRY_TYPES: TimelineEntry["type"][] = [
  "visit",
  "lab",
  "referral",
  "note",
  "intake",
  "ultrasound",
];

const TRIMESTERS: ExtractResult["trimester"][] = [
  "first",
  "second",
  "third",
  "postpartum",
];

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function asFlags(value: unknown): DocFlag[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.field !== "string" || typeof row.issue !== "string") {
        return null;
      }
      return {
        field: row.field,
        issue: row.issue,
        resolved: Boolean(row.resolved),
      };
    })
    .filter((f): f is DocFlag => f !== null);
}

/** Parse model text into ExtractResult, or null if invalid. */
export function parseExtractResult(text: string): ExtractResult | null {
  try {
    const parsed = JSON.parse(stripFences(text)) as Record<string, unknown>;
    if (typeof parsed.title !== "string" || typeof parsed.summary !== "string") {
      return null;
    }

    const type = ENTRY_TYPES.includes(parsed.type as TimelineEntry["type"])
      ? (parsed.type as TimelineEntry["type"])
      : "note";
    const trimester = TRIMESTERS.includes(
      parsed.trimester as ExtractResult["trimester"],
    )
      ? (parsed.trimester as ExtractResult["trimester"])
      : "first";

    const fields =
      parsed.fields && typeof parsed.fields === "object" && !Array.isArray(parsed.fields)
        ? (parsed.fields as Record<string, string | number | boolean | null>)
        : {};

    const checklist =
      typeof parsed.checklist_item_id === "string"
        ? parsed.checklist_item_id
        : undefined;

    return {
      title: parsed.title,
      summary: parsed.summary,
      type,
      trimester,
      checklist_item_id: checklist,
      fields,
      flags: asFlags(parsed.flags),
      raw_text_extracted:
        typeof parsed.raw_text_extracted === "string"
          ? parsed.raw_text_extracted
          : parsed.summary,
    };
  } catch {
    return null;
  }
}
