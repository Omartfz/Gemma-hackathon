import type {
  ExtractRequest,
  ExtractResponse,
  ExtractResult,
  GemmaMode,
} from "@/lib/types";
import { extractWithCloudGemma } from "./cloud-gemma";
import { fixtureForFilename } from "./fixtures";
import { extractWithOllama } from "./ollama";
import { extractWithOpenAI } from "./openai";
import { parseExtractResult } from "./parse";
import { textFromPdfBase64 } from "./pdf-text";

function cloudProvider(): "openai" | "gemma" {
  const raw = (process.env.EXTRACT_CLOUD_PROVIDER || "gemma").toLowerCase();
  if (raw === "openai") return "openai";
  return "gemma";
}

function isPdf(input: ExtractRequest): boolean {
  const mime = input.mimeType?.toLowerCase() ?? "";
  const name = input.filename.toLowerCase();
  return mime.includes("pdf") || name.endsWith(".pdf");
}

function isSparse(result: ExtractResult): boolean {
  const name = result.fields.patient_name;
  const hasName = typeof name === "string" && name.trim().length > 0;
  const keys = Object.keys(result.fields);
  return !hasName && keys.length < 3;
}

async function withPdfText(input: ExtractRequest): Promise<ExtractRequest> {
  if (input.textHint?.trim()) return input;
  if (!input.imageBase64 || !isPdf(input)) return input;
  const text = await textFromPdfBase64(input.imageBase64);
  if (!text) return input;
  return { ...input, textHint: text };
}

function finalize(
  filename: string,
  source: ExtractResponse["source"],
  result: ExtractResult,
): ExtractResponse {
  if (isSparse(result)) {
    return { source: "fixture", result: fixtureForFilename(filename) };
  }
  return { source, result };
}

function forOpenAI(input: ExtractRequest): ExtractRequest {
  // Avoid attaching PDF binary as a fake image_url
  if (isPdf(input)) {
    const { imageBase64: _drop, ...rest } = input;
    return rest;
  }
  return input;
}

async function runCloud(input: ExtractRequest): Promise<ExtractResponse> {
  const enriched = await withPdfText(input);
  const provider = cloudProvider();
  try {
    const text =
      provider === "openai"
        ? await extractWithOpenAI(forOpenAI(enriched))
        : await extractWithCloudGemma(enriched);
    const parsed = parseExtractResult(text);
    if (!parsed) {
      throw new Error("Failed to parse model JSON");
    }
    return finalize(
      enriched.filename,
      provider === "gemma" ? "cloud" : "openai",
      parsed,
    );
  } catch {
    if (provider === "gemma" && process.env.OPENAI_API_KEY?.trim()) {
      try {
        const text = await extractWithOpenAI(forOpenAI(enriched));
        const parsed = parseExtractResult(text);
        if (parsed) {
          return finalize(enriched.filename, "openai", parsed);
        }
      } catch {
        /* fall through */
      }
    }
    return {
      source: "fixture",
      result: fixtureForFilename(enriched.filename),
    };
  }
}

async function runLocal(input: ExtractRequest): Promise<ExtractResponse> {
  const enriched = await withPdfText(input);
  try {
    const text = await extractWithOllama(enriched);
    const parsed = parseExtractResult(text);
    if (!parsed) {
      throw new Error("Failed to parse model JSON");
    }
    return finalize(enriched.filename, "local", parsed);
  } catch {
    return {
      source: "fixture",
      result: fixtureForFilename(enriched.filename),
    };
  }
}

/** Orchestrate extract: Cloud Gemma / Ollama / OpenAI / fixtures. */
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
