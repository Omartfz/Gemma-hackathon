# Omar — Execution Phases

Work lives in [`thread-app/`](thread-app/). Team contract: [`PLAN.md`](PLAN.md).  
Agent guidance: [`.agents/skills/gemma-dev`](.agents/skills/gemma-dev).

**Owns:** Schedule (book + list), Upload Docs, Meeting Prep, Document Library, extract client, Tavily research, readiness/agent tools.  
**Daniel owns:** Onboarding form + Home (visual trimester timeline of uploaded docs).

---

## Phase 1–2 (done)

Shared store/types + `POST /api/extract` (OpenAI temp / Ollama / fixtures).

## Phase 3 (done)

Prep by appointment + targeted Upload (`missing` / `uploaded` / `need_check`).

## Phase 4 — Schedule + book + Tavily docs (done)

### Schedule `/schedule`
- Lists upcoming (and completed) appointments from the store
- CTA: Book appointment

### Book `/schedule/book`
1. User fills type, date, location, provider, week, notes
2. **Research documents** → `POST /api/research-docs`
3. Review suggested docs (why + citations), confirm
4. Saves new `Appointment` with `required_doc_ids`, `doc_reasons`, `research_citations`

### Research API
| Path | Behavior |
| --- | --- |
| `TAVILY_API_KEY` set | Tavily search → optional OpenAI structure → `source: "tavily"` |
| No key / failure | Fixtures by appointment type → `source: "fixture"` |

**Code:** `src/lib/research/*`, `src/app/api/research-docs/route.ts`, `src/app/schedule/*`  
**Env:** `TAVILY_API_KEY` in `.env.local` / `.env.example`

## Phase 5 — Agentic readiness (done)

Fixed tool loop (not a free chat agent):

1. Prep → **Run readiness check** → `POST /api/readiness` with `{ appointment_id, state }`
2. Server: `get_required_docs` → N× `check_document` → `compute_readiness` → short summary (OpenAI or fixture)
3. Client writes `readinessScore`; UI shows summary + expandable tool trace

**Code:** `src/lib/agent/*`, `src/app/api/readiness/route.ts`, Prep page  
**Score:** `round(100 * (uploaded + 0.5 * need_check) / required)`

## Phase 6 — Polish

Library UI, mode toggle, synthetic PDFs in repo.

---

## Import paths for Daniel

```ts
import type { Appointment, AppState, PatientProfile } from "@/lib/types";
import { loadState, updateState, ensureAppointments } from "@/lib/store";
import { getAppointmentPrepViews } from "@/lib/checklist-status";
```

When writing `profile` from onboarding, either also set `appointments` or rely on `ensureAppointments` on next `loadState()`.
