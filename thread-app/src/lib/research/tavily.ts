import type { ResearchCitation } from "@/lib/types";

export type TavilyHit = {
  title: string;
  url: string;
  content: string;
};

/** Search public web sources for appointment prep documents (decision-support only). */
export async function searchTavily(query: string): Promise<{
  hits: TavilyHit[];
  citations: ResearchCitation[];
}> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set");
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: false,
      max_results: 5,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tavily error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    results?: { title?: string; url?: string; content?: string }[];
  };

  const hits: TavilyHit[] = (data.results ?? [])
    .filter((r) => r.url && r.title)
    .map((r) => ({
      title: r.title ?? "Source",
      url: r.url ?? "",
      content: r.content ?? "",
    }));

  return {
    hits,
    citations: hits.map((h) => ({ title: h.title, url: h.url })),
  };
}
