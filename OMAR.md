# Omar — Execution Phases

Work lives in [`thread-app/`](thread-app/). Team contract: [`PLAN.md`](PLAN.md).

**Owns:** Upload Docs, Meeting Prep, Document Library, Gemma dual client, synthetic pack, readiness logic.  
**Daniel owns:** Onboarding form + Home (reads shared store).

---

## Phase 1 — Shared foundation (current)

- Types: `PatientProfile`, `TimelineEntry`, `DocFlag`, `LibraryDoc`, `GemmaMode`, `AppState`
- `localStorage` store (`thread-app-state`)
- Zone 1 required-docs checklist
- Stub routes: `/upload`, `/prep`, `/library` + nav
- Leave `/onboarding` for Daniel

**Code:** `thread-app/src/lib/*`, `thread-app/src/components/AppNav.tsx`, stub pages

## Phase 2 — Gemma extract API

- `POST /api/extract`
- Clients: Ollama (local) + cloud API key
- Deterministic fixture fallback by filename so demo never dies

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
