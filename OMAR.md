# Omar — Execution Phases

Work lives in [`thread-app/`](thread-app/). Team contract: [`PLAN.md`](PLAN.md).  
Agent guidance: [`.agents/skills/gemma-dev`](.agents/skills/gemma-dev).

**Owns:** Upload Docs, Meeting Prep, Document Library, extract client, readiness/agent tools.  
**Daniel owns:** Onboarding form + Home (reads shared store).

---

## Phase 1–2 (done)

Shared store/types + `POST /api/extract` (OpenAI temp / Ollama / fixtures).

## Phase 3 — Prep by appointment + targeted Upload (done)

**Still not a full agent loop** — statuses are computed from store data.

### Meeting Prep `/prep`
- Lists **upcoming appointments**
- Under each: required docs with **why** + status:
  - `missing` — no doc for that appointment + checklist id
  - `uploaded` — saved, no open flags
  - `need_check` — saved, unresolved extract flags

### Upload `/upload`
1. Select **appointment**
2. Select **document title** from that appointment’s required list
3. File → Extract → Save (writes `appointment_id` + `checklist_item_id`)

### Data
- `Appointment` on `AppState.appointments`
- `LibraryDoc.appointment_id`
- Seed: `ensureAppointments()` from `profile.next_appointment` + Zone 1 required ids
- Helpers: `getAppointmentPrepViews`, `saveExtractToStore({ appointmentId, checklistItemId, ... })`

## Next — Agentic readiness

Tools over the same appointment/doc model: `get_required_docs`, `check_document`, `compute_readiness`.

## Phase 4 / 6

Library UI polish; mode toggle; synthetic PDFs in repo.

---

## Import paths for Daniel

```ts
import type { Appointment, AppState, PatientProfile } from "@/lib/types";
import { loadState, updateState, ensureAppointments } from "@/lib/store";
import { getAppointmentPrepViews } from "@/lib/checklist-status";
```

When writing `profile` from onboarding, either also set `appointments` or rely on `ensureAppointments` on next `loadState()`.
