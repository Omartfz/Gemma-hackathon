/** Pull plain text from a PDF (base64) for model extract prompts. */

export async function textFromPdfBase64(
  base64: string,
): Promise<string | undefined> {
  try {
    const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    if (bytes.byteLength === 0) return undefined;

    const { extractText } = await import("unpdf");
    const result = await extractText(bytes, { mergePages: true });
    const text = Array.isArray(result.text)
      ? result.text.join("\n")
      : String(result.text ?? "");
    const trimmed = text.replace(/\0/g, "").trim();
    if (trimmed.length < 20) return undefined;
    // Keep prompt size reasonable for cloud models
    return trimmed.slice(0, 12000);
  } catch {
    return undefined;
  }
}
