export type GemmaMode = "local" | "cloud";

export type PatientProfile = {
  name: string;
  gestational_week: number;
  due_date?: string;
  provider: { name: string; role: string };
  next_appointment: { date: string; title: string };
  onboarding_source: "form" | "ehr_roadmap";
};

export type DocFlag = {
  field: string;
  issue: string;
  resolved: boolean;
};

export type TimelineEntry = {
  id: string;
  date: string;
  trimester: "first" | "second" | "third" | "postpartum";
  type: "visit" | "lab" | "referral" | "note" | "intake" | "ultrasound";
  provider: { name: string; role: string };
  category: string;
  title: string;
  summary: string;
  fields: Record<string, string | number | boolean | null>;
  flags: DocFlag[];
  source_doc: { doc_id: string; filename: string; uploaded_at: string };
};

export type LibraryDoc = {
  doc_id: string;
  filename: string;
  uploaded_at: string;
  linked_entry_id: string | null;
  raw_text_extracted: string;
  checklist_item_id?: string;
  /** Upcoming visit this document was uploaded for */
  appointment_id?: string;
};

export type RequiredDocItem = {
  id: string;
  label: string;
  description: string;
  /** Matches TimelineEntry.type when known */
  doc_type?: TimelineEntry["type"];
};

export type Appointment = {
  id: string;
  date: string;
  title: string;
  provider: { name: string; role: string };
  /** Checklist item ids required for this visit */
  required_doc_ids: string[];
};

export type AppState = {
  profile: PatientProfile | null;
  appointments: Appointment[];
  entries: TimelineEntry[];
  documents: LibraryDoc[];
  gemmaMode: GemmaMode;
  readinessScore: number | null;
};

/** Result of document extraction (LLM or fixture). */
export type ExtractResult = {
  title: string;
  summary: string;
  type: TimelineEntry["type"];
  trimester: "first" | "second" | "third" | "postpartum";
  checklist_item_id?: string;
  fields: Record<string, string | number | boolean | null>;
  flags: DocFlag[];
  raw_text_extracted: string;
};

export type ExtractSource = "openai" | "local" | "cloud" | "fixture";

export type ExtractResponse = {
  source: ExtractSource;
  result: ExtractResult;
};

export type ExtractRequest = {
  mode?: GemmaMode;
  filename: string;
  mimeType?: string;
  textHint?: string;
  imageBase64?: string;
};
