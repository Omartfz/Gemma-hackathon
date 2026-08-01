import type { AppState } from "@/lib/types";
import { summarizeReadiness } from "./summarize";
import {
  check_document,
  compute_readiness,
  get_required_docs,
  type CheckDocumentResult,
} from "./tools";

export type AgentStep = {
  tool: "get_required_docs" | "check_document" | "compute_readiness";
  input?: Record<string, string>;
  output: unknown;
};

export type ReadinessRunResult = {
  appointment_id: string;
  score: number;
  docs: CheckDocumentResult[];
  summary: string;
  summary_source: "openai" | "fixture";
  steps: AgentStep[];
};

/** Fixed tool loop: required docs → check each → score → short summary. */
export async function runReadiness(
  state: AppState,
  appointmentId: string,
): Promise<ReadinessRunResult> {
  const steps: AgentStep[] = [];

  const required = get_required_docs(state, appointmentId);
  steps.push({
    tool: "get_required_docs",
    input: { appointment_id: appointmentId },
    output: required,
  });

  const docs: CheckDocumentResult[] = [];
  for (const item of required) {
    const checked = check_document(state, appointmentId, item.id);
    docs.push(checked);
    steps.push({
      tool: "check_document",
      input: {
        appointment_id: appointmentId,
        checklist_item_id: item.id,
      },
      output: checked,
    });
  }

  const readiness = compute_readiness(docs);
  steps.push({
    tool: "compute_readiness",
    input: { appointment_id: appointmentId },
    output: readiness,
  });

  const appointment = state.appointments.find((a) => a.id === appointmentId)!;
  const { summary, source } = await summarizeReadiness({
    appointmentTitle: appointment.title,
    readiness,
    checks: docs,
  });

  return {
    appointment_id: appointmentId,
    score: readiness.score,
    docs,
    summary,
    summary_source: source,
    steps,
  };
}
