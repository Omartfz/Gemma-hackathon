import type {
  ResearchDocsRequest,
  ResearchDocsResponse,
} from "@/lib/types";
import { fixtureResearchDocs } from "./fixtures";
import { structureDocsWithModel } from "./parse";
import { searchTavily } from "./tavily";

function buildQuery(input: ResearchDocsRequest): string {
  const week =
    typeof input.gestational_week === "number"
      ? `week ${input.gestational_week}`
      : "pregnancy";
  return [
    "what documents to bring",
    input.appointment_type.replace(/_/g, " "),
    "prenatal appointment",
    week,
    input.provider_role ?? "",
    "insurance intake labs ultrasound paperwork site:.gov OR ACOG",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Research required docs via Tavily (+ Gemma/OpenAI structure), else fixtures. */
export async function runResearchDocs(
  input: ResearchDocsRequest,
): Promise<ResearchDocsResponse> {
  const appointmentType = input.appointment_type?.trim() || "other";

  try {
    const { hits, citations } = await searchTavily(buildQuery(input));
    const structured = await structureDocsWithModel({
      appointment_type: appointmentType,
      gestational_week: input.gestational_week,
      provider_role: input.provider_role,
      notes: input.notes,
      hits,
    });

    if (structured && structured.length > 0) {
      return {
        source: "tavily",
        required: structured,
        citations: citations.slice(0, 5),
      };
    }

    // Tavily worked but structuring failed — merge fixture labels with citations
    const fixture = fixtureResearchDocs(appointmentType);
    return {
      source: "tavily",
      required: fixture.required,
      citations: citations.length ? citations.slice(0, 5) : fixture.citations,
    };
  } catch {
    return fixtureResearchDocs(appointmentType);
  }
}
