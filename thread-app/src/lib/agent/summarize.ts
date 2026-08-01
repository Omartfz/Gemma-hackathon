import {
  generateWithGoogle,
  hasGoogleApiKey,
} from "@/lib/gemma/google-ai";
import type { CheckDocumentResult, ComputeReadinessResult } from "./tools";

function fixtureSummary(
  appointmentTitle: string,
  readiness: ComputeReadinessResult,
  checks: CheckDocumentResult[],
): string {
  const { counts, score } = readiness;
  if (counts.required === 0) {
    return `${appointmentTitle}: no required documents listed. Readiness ${score}%.`;
  }
  if (counts.missing === 0 && counts.need_check === 0) {
    return `${appointmentTitle}: all ${counts.required} documents look ready. Readiness ${score}%.`;
  }

  const missingLabels = checks
    .filter((c) => c.status === "missing")
    .map((c) => c.label);
  const flagBits = checks
    .filter((c) => c.status === "need_check")
    .map((c) => {
      const issue = c.open_flags[0]?.issue;
      return issue ? `${c.label} (${issue})` : c.label;
    });

  const parts: string[] = [`${appointmentTitle}: readiness ${score}%.`];
  if (missingLabels.length) {
    parts.push(`Still missing: ${missingLabels.join(", ")}.`);
  }
  if (flagBits.length) {
    parts.push(`Needs a paperwork check: ${flagBits.join("; ")}.`);
  }
  parts.push("Documentation completeness only — not medical advice.");
  return parts.join(" ");
}

export type SummarySource = "gemma" | "openai" | "fixture";

/** Short natural-language summary; Gemma (Google) first, else OpenAI, else fixture. */
export async function summarizeReadiness(input: {
  appointmentTitle: string;
  readiness: ComputeReadinessResult;
  checks: CheckDocumentResult[];
}): Promise<{ summary: string; source: SummarySource }> {
  const fallback = fixtureSummary(
    input.appointmentTitle,
    input.readiness,
    input.checks,
  );

  const docLines = input.checks
    .map((c) => {
      const flags =
        c.open_flags.length > 0
          ? ` flags=${c.open_flags.map((f) => f.issue).join("; ")}`
          : "";
      return `- ${c.label}: ${c.status}${flags}`;
    })
    .join("\n");

  const system = `You summarize pregnancy visit paperwork readiness for Thread.
Decision-support only — never diagnose or give medical advice.
Write 2-3 short sentences. Mention score and what's missing or needs a check.`;

  const user = `Appointment: ${input.appointmentTitle}
Score: ${input.readiness.score}%
Counts: ${JSON.stringify(input.readiness.counts)}
Docs:
${docLines}`;

  if (hasGoogleApiKey()) {
    try {
      const content = (
        await generateWithGoogle({ system, user, json: false })
      ).trim();
      if (content) return { summary: content, source: "gemma" };
    } catch {
      /* try OpenAI */
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return { summary: fallback, source: "fixture" };
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      return { summary: fallback, source: "fixture" };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { summary: fallback, source: "fixture" };
    }
    return { summary: content, source: "openai" };
  } catch {
    return { summary: fallback, source: "fixture" };
  }
}
