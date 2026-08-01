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
  const raw = (process.env.EXTRACT_CLOUD_PROVIDER || "gemma").toLowerCase();
  if (raw === "openai") return "openai";
  return "gemma";
}

async function runCloud(input: ExtractRequest): Promise<ExtractResponse> {
  const provider = cloudProvider();
  try {
    const text =
      provider === "openai"
        ? await extractWithOpenAI(input)
        : await extractWithCloudGemma(input);
    const parsed = parseExtractResult(text);
    if (!parsed) {
      throw new Error("Failed to parse model JSON");
    }
    return {
      source: provider === "gemma" ? "cloud" : "openai",
      result: parsed,
    };
  } catch {
    // Gemma failed → try OpenAI if keyed, else fixtures
    if (provider === "gemma" && process.env.OPENAI_API_KEY?.trim()) {
      try {
        const text = await extractWithOpenAI(input);
        const parsed = parseExtractResult(text);
        if (parsed) return { source: "openai", result: parsed };
      } catch {
        /* fall through */
      }
    }
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

/** Orchestrate extract: Cloud Gemma (Google) / Ollama local / OpenAI fallback / fixtures. */
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
