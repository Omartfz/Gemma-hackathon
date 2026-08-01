import type { PatientProfile, TimelineEntry } from "@/lib/types";

/**
 * Shape returned by extractDocument, regardless of whether it came from a
 * hardcoded fixture (now) or a real Gemma/Ollama call (later). Keeping this
 * stable is what makes extract.ts a drop-in swap point.
 */
export type ExtractionResult = {
  recognized: boolean;
  entry: Pick<
    TimelineEntry,
    "date" | "trimester" | "type" | "provider" | "category" | "title" | "summary" | "fields" | "flags"
  >;
  rawTextExtracted: string;
  profileFields: Partial<Pick<PatientProfile, "name" | "gestational_week" | "due_date" | "provider">>;
};

export type DocFixture = {
  matches: (filename: string) => boolean;
  result: ExtractionResult;
};
