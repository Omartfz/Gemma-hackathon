import type {
  ExtractRequest,
  ExtractResponse,
  GemmaMode,
} from "@/lib/types";
import { extractWithCloudGemma } from "./cloud-gemma";
import { fixtureForFilename } from "./fixtures";
import { extractWithOllama } from "./ollama";
import { extractWithOpenAI } from "./openai";
import { parseExtractResult } from "./parse";

function cloudProvider(): "openai" | "gemma" {
  const raw = (process.env.EXTRACT_CLOUD_PROVIDER || "openai").toLowerCase();
  return raw === "gemma" ? "gemma" : "openai";
}

async function runCloud(input: ExtractRequest): Promise<ExtractResponse> {
  const provider = cloudProvider();
  try {
    const text =
      provider === "gemma"
        ? await extractWithCloudGemma(input)
        : await extractWithOpenAI(input);
    const parsed = parseExtractResult(text);
    if (!parsed) {
      throw new Error("Failed to parse model JSON");
    }
    return {
      source: provider === "gemma" ? "cloud" : "openai",
      result: parsed,
    };
  } catch {
    return {
      source: "fixture",
      result: fixtureForFilename(input.filename),
    };
  }
}

async function runLocal(input: ExtractRequest): Promise<ExtractResponse> {
  try {
    const text = await extractWithOllama(input);
    const parsed = parseExtractResult(text);
    if (!parsed) {
      throw new Error("Failed to parse model JSON");
    }
    return { source: "local", result: parsed };
  } catch {
    return {
      source: "fixture",
      result: fixtureForFilename(input.filename),
    };
  }
}

/** Orchestrate extract: OpenAI (temp cloud) / Ollama local / fixtures. */
export async function runExtract(
  input: ExtractRequest,
): Promise<ExtractResponse> {
  if (!input.filename?.trim()) {
    return {
      source: "fixture",
      result: fixtureForFilename("unknown.pdf"),
    };
  }

  const mode: GemmaMode = input.mode === "local" ? "local" : "cloud";

  if (mode === "local") {
    return runLocal(input);
  }
  return runCloud(input);
}
