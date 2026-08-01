# Omar — Execution Phases

Work lives in [`thread-app/`](thread-app/). Team contract: [`PLAN.md`](PLAN.md).  
Agent guidance: [`.agents/skills/gemma-dev`](.agents/skills/gemma-dev) (from [google-gemma/gemma-skills](https://github.com/google-gemma/gemma-skills)).

**Owns:** Upload Docs, Meeting Prep, Document Library, extract client, synthetic pack, readiness logic.  
**Daniel owns:** Onboarding form + Home (reads shared store).

---

## Phase 1 — Shared foundation (done)

- Types / store / Zone 1 checklist / stub routes + nav

## Phase 2 — Extract API (done)

`POST /api/extract` — OpenAI (temp cloud) / Ollama local / filename fixtures.

## Phase 3 — Required docs list + thin Upload (done)

**Not agentic yet** — static checklist UI + one-shot extract→save.

### Meeting Prep `/prep`
- Lists Zone 1 docs from `ZONE1_REQUIRED_DOCS`
- Each item: **what** + **why** + **Have / Missing**
- Have = store `documents[]` with matching `checklist_item_id`

### Upload `/upload` (minimal)
- File pick → Extract → show JSON → Save to store
- CareOS PDF **filenames** drive fixtures (no PDF parsing)

**Code:**
- `thread-app/src/lib/checklist-status.ts`
- `thread-app/src/lib/save-extract.ts`
- `thread-app/src/lib/ids.ts`
- `thread-app/src/app/prep/page.tsx`
- `thread-app/src/app/upload/page.tsx`

## Phase 4 — Document Library

- List + detail from store (thin)

## Phase 5 — Agentic readiness (next focus)

- Tools: `get_required_docs`, `check_document`, `update_task_list`, `compute_readiness`
- Orchestrator loop (OpenAI tools now → Gemma later)
- Write `readinessScore` for Home CTA

## Phase 6 — Polish

- Mode toggle, disclaimer, synthetic pack in repo

---

## Import paths for Daniel

```ts
import type { AppState, PatientProfile, TimelineEntry } from "@/lib/types";
import { loadState, saveState, updateState, defaultState } from "@/lib/store";
import { ZONE1_REQUIRED_DOCS } from "@/lib/checklist-zone1";
import { getRequiredDocStatuses } from "@/lib/checklist-status";
```
