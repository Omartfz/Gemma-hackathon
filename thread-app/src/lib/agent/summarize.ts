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

/** Short natural-language summary; OpenAI if keyed, else deterministic fixture. */
export async function summarizeReadiness(input: {
  appointmentTitle: string;
  readiness: ComputeReadinessResult;
  checks: CheckDocumentResult[];
}): Promise<{ summary: string; source: "openai" | "fixture" }> {
  const fallback = fixtureSummary(
    input.appointmentTitle,
    input.readiness,
    input.checks,
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { summary: fallback, source: "fixture" };
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const docLines = input.checks
    .map((c) => {
      const flags =
        c.open_flags.length > 0
          ? ` flags=${c.open_flags.map((f) => f.issue).join("; ")}`
          : "";
      return `- ${c.label}: ${c.status}${flags}`;
    })
    .join("\n");

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
          {
            role: "system",
            content: `You summarize pregnancy visit paperwork readiness for Thread.
Decision-support only — never diagnose or give medical advice.
Write 2-3 short sentences. Mention score and what's missing or needs a check.`,
          },
          {
            role: "user",
            content: `Appointment: ${input.appointmentTitle}
Score: ${input.readiness.score}%
Counts: ${JSON.stringify(input.readiness.counts)}
Docs:
${docLines}`,
          },
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
