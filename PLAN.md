# Thread — Shared Hackathon Plan

**Source of truth for Omar + Daniel (and AIs).**  
Keep this file updated when the team agrees on changes. Align [README.md](README.md) with this plan when they drift.

**Event:** Build with Gemma NYC — On-Device AI for Healthcare  
**Track:** Track 2 (Agentic Care Copilots), with a privacy angle when local Gemma is chosen  
**Constraint:** Decision-support only · Synthetic/public data only · Never diagnosis or treatment

---

## Product thesis

**Thread** helps a pregnant patient answer three questions:

1. Where am I in this process?
2. What do I need to do next?
3. Am I ready for what’s coming?

Core wow: **Gemma 4** reads uploaded documents, flags incomplete/off fields, and powers meeting readiness — not a bolted-on chatbot.

---

## Team split

| Person | Owns |
| --- | --- |
| **Daniel** | **Onboarding** (form) + **Home** (visual trimester timeline of uploaded docs, Prep CTA, empty state). “Connect EHR” as disabled/roadmap choice only. |
| **Omar** | **Schedule** (list + book), **Upload Docs**, **Meeting Prep**, **Document Library**, extract client, **Tavily** doc research, readiness/agent tools |

**Shared first (~30 min before diverging):** lock schemas + Zone 1 checklist + demo persona so both bind to the same store.

**Handoff contract**

- Daniel’s onboarding **writes** patient profile (+ next appointment); `ensureAppointments` can seed Schedule.
- Omar’s Schedule/book **writes** `appointments` (with required docs from Tavily/fixtures).
- Omar’s Upload **writes** documents, timeline entries, flags linked to appointments.
- Home, Schedule, Prep, and Upload **read** the shared store.
- Do not invent parallel data models.

---

## Runtime: Gemma local or API

User-facing toggle: **Private (local)** vs **Cloud (API)**

| Mode | How | Notes |
| --- | --- | --- |
| Private | Ollama + Gemma 4 E2B on the machine (`localhost:11434`) | Set up later; smallest local download |
| Cloud | Gemma via API key | Reliable demo path |
| Fallback | Scripted/fixture extraction | Only if neither model path works mid-demo |

Same prompts and tools for both modes — only the model client changes.  
**Do not** bet the live demo on airplane-mode-only.

```text
Onboarding form → shared store
Thread UI → Gemma mode toggle → Ollama (local) OR API (cloud)
                → doc readiness tools → shared store
```

---

## Patient identity (no EHR in demo)

**Demo path:** Onboarding **form** collects:

- Patient name
- Gestational week and/or due date
- Provider name / role
- Next appointment date (+ optional title)

Optional: pre-fill **Maya, week 12, Dr. Sarah Chen, next visit ~2 weeks out** for a fast demo.

**Pitch / UI only (not built live):** secondary choice — “Connect your clinic record (OnTross / Athena)” — disabled or “coming soon.” Explains continuity-of-care vision without fake API calls.

| Integration | Demo reality |
| --- | --- |
| Gemma 4 | Core — local and/or API (OpenAI temp for extract if no Gemma key) |
| OnTross / Athena | Not in demo — roadmap only |
| Tavily | Live for book-appointment doc research; **fixture fallback** if no `TAVILY_API_KEY` |

---

## Pages (MVP)

0. **Onboarding** — form required; Connect EHR non-functional  
1. **Home** (Daniel) — trimester-zone timeline of uploaded docs, Prep CTA, empty state  
2. **Schedule** (Omar) — upcoming appointments + **Book appointment** (type/where/who/notes → Tavily research → required docs)  
3. **Upload Docs** — pick appointment + document title → extract → save  
4. **Meeting Prep** — per-appointment docs with missing / uploaded / need check  
5. **Document Library** — list + detail (modal/expand)

**Demo focus:** Zone 1 (First Trimester) only. Zones 2–4 may be visual scaffolding with little content.

### Care timeline zones (Home)

1. First Trimester (W1–W12) — Onboarding & Baseline  
2. Second Trimester (W13–W27) — Tracking & Screening  
3. Third Trimester (W28–W40) — Birth Plan & Admin  
4. Postpartum (W41+ / 0–12 weeks post-birth) — Recovery & Newborn  

Meeting Prep checklist is tied to current stage (Zone 1 for demo).

---

## Agent / tools (document readiness — not EHR fetch)

Fixed loop via `POST /api/readiness` (client passes AppState):

- `get_required_docs(appointment_id)` → appointment required docs + reasons  
- `check_document` → status + open extract flags (no re-extract)  
- `compute_readiness` → score → Meeting Prep + Home CTA  

**Safety:** Flags = documentation completeness only. Never interpret symptoms or diagnose.

---

## Data to lock (before splitting work)

Use the outer shapes from [README.md](README.md) (timeline entry + document library entry). Also define:

- **Patient profile** (from onboarding form)  
- **Zone 1 required-docs checklist** (static JSON)  
- **Persistence:** `localStorage` or IndexedDB — no accounts / login  
- **Synthetic docs (Omar):** 3–5 files — good / incomplete / wrong-appointment — with expected extract + flags written down  

Repo may already contain CareOS synthetic PDFs (intake, labs, ultrasound) — prefer those for Zone 1 demo when compatible.

### Suggested patient profile shape

```json
{
  "name": "Maya Rivera",
  "gestational_week": 12,
  "due_date": "2026-09-15",
  "provider": { "name": "Dr. Sarah Chen", "role": "OB/GYN" },
  "next_appointment": {
    "date": "2026-03-14",
    "title": "12-Week Prenatal Checkup"
  },
  "onboarding_source": "form"
}
```

Timeline entry + document library shapes: see README “Data Model” section — keep `fields` loosely typed per doc type.

---

## Stack (default)

- **Next.js (App Router) + TypeScript**
- API routes proxy Ollama / cloud Gemma (avoid browser CORS; keep keys server-side)
- Tailwind or CSS modules — calm healthcare UI (avoid generic purple SaaS look)
- No login

If the team prefers Vite instead, agree in chat and update this file before scaffolding.

---

## Demo script (~2 min)

1. Onboarding / demo profile (Maya OK)  
2. **Schedule → Book appointment** → Research documents (Tavily or fixture) → Confirm  
3. Meeting Prep → see new appointment’s required docs (missing / uploaded / need check)  
4. Upload → pick that appointment + doc title → extract → save  
5. Home timeline shows uploaded entries (Daniel)  
6. Disclaimer: decision-support / synthetic only  

---

## Explicitly later (not blocking)

- Ollama install + `gemma4:e2b` pull  
- Real OnTross credentials / live EHR connect  
- Swap OpenAI extract → Gemma cloud  
- In-browser LiteRT / WebGPU  
- Rich Zones 2–4 on Home  
- Full multi-tool readiness agent polish  
- Kaggle writeup final draft  

---

## Work checklist

- [x] Lock schemas + Zone 1 checklist + Maya persona (shared)  
- [x] Scaffold Next.js + shared store + routes  
- [ ] Daniel: Onboarding form + Home  
- [x] Omar: Extract API (OpenAI temp / fixtures)  
- [x] Omar: Prep by appointment + targeted Upload  
- [x] Omar: Schedule + book + Tavily research  
- [x] Omar: Agentic readiness loop  
- [x] Omar: Document Library polish  
- [x] Mode toggle, disclaimers, sync README with this plan  

---

## README drift

Older README wording may still say “100% offline” or EHR-first flows. **This file wins** until README is updated to: onboarding form (EHR later) + Schedule/book + hybrid Gemma local/API + Tavily doc research + document readiness.
