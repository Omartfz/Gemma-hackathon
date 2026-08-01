# Omar — Execution Phases

Work lives in [`thread-app/`](thread-app/). Team contract: [`PLAN.md`](PLAN.md).  
Agent guidance: [`.agents/skills/gemma-dev`](.agents/skills/gemma-dev) (from [google-gemma/gemma-skills](https://github.com/google-gemma/gemma-skills)).

**Owns:** Upload Docs, Meeting Prep, Document Library, extract client, synthetic pack, readiness logic.  
**Daniel owns:** Onboarding form + Home (reads shared store).

---

## Phase 1 — Shared foundation (done)

- Types / store / Zone 1 checklist / stub routes + nav

## Phase 2 — Extract API (done)

`POST /api/extract` with:

| Mode | Behavior |
| --- | --- |
| `cloud` (default) | **OpenAI** via `OPENAI_API_KEY` (temporary until Gemma keys) |
| `local` | Ollama `gemma4:e2b` if running |
| fallback | Deterministic **fixtures** by filename (demo never dies) |

**Code:**
- `thread-app/src/lib/gemma/extract.ts` — orchestrator
- `thread-app/src/lib/gemma/openai.ts` — live OpenAI
- `thread-app/src/lib/gemma/ollama.ts` — local Gemma
- `thread-app/src/lib/gemma/cloud-gemma.ts` — stub for later Google AI
- `thread-app/src/lib/gemma/fixtures.ts` — CareOS Template_1/2/3 + incomplete + insurance
- `thread-app/src/app/api/extract/route.ts`

**Env:** copy `thread-app/.env.example` → `thread-app/.env.local`

**Try (no key → fixture):**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "content-type: application/json" \
  -d "{\"filename\":\"CareOS_Template_1_Maternal_Baseline_Intake_Form.pdf\",\"mode\":\"cloud\"}"
```

**Later swap to Gemma cloud:** implement `cloud-gemma.ts`, set `EXTRACT_CLOUD_PROVIDER=gemma` + `GOOGLE_API_KEY`.

## Phase 3 — Upload Docs

- Upload PDF/image → extract → fields + flags → inline edit → save to store

## Phase 4 — Document Library

- List + detail modal from store

## Phase 5 — Meeting Prep

- Checklist vs uploaded docs, gaps, drafted questions, readiness score → store for Home CTA

## Phase 6 — Polish

- Gemma mode toggle, disclaimer, CareOS PDFs as synthetic pack

---

## Import paths for Daniel

```ts
import type { AppState, PatientProfile, TimelineEntry } from "@/lib/types";
import { loadState, saveState, updateState, defaultState } from "@/lib/store";
import { ZONE1_REQUIRED_DOCS } from "@/lib/checklist-zone1";
```
