# Thread — Pregnancy Care Companion

> **Team agreement:** [PLAN.md](PLAN.md) is the source of truth. This README matches that plan.

**Event:** Build with Gemma NYC — On-Device AI for Healthcare  
**Track:** Track 2 (Agentic Care Copilots), hybrid local/cloud Gemma  
**Constraint:** Decision-support only · Synthetic/public data only · Never diagnosis

App code lives in [`thread-app/`](thread-app/). Omar phases: [`OMAR.md`](OMAR.md).

## Problem

Pregnant patients see multiple providers over 9+ months. Info gets lost between visits; patients walk into appointments unprepared. This data is deeply private.

## Solution

Thread turns visit documents into a shared local timeline and paperwork checklist. Gemma extracts fields, flags incomplete docs, and powers meeting readiness. Demo path uses an **onboarding form** (EHR/OnTross is roadmap only). Extract can run **local (Ollama)** or **cloud (API)** via a nav toggle.

## Key points

- Upload visit documents (PDFs / photos) linked to an appointment + required doc title
- Extract → structured fields + flags (OpenAI temp / Ollama / filename fixtures)
- **Schedule → Book** researches required docs (Tavily or fixtures) then saves the appointment
- **Meeting Prep** shows missing / uploaded / need_check; **Run readiness check** runs the agent tool loop
- **Document Library** lists saved docs with expand detail
- Synthetic data only — decision-support, never diagnosis

## Pages

| Route | Owner | Role |
| --- | --- | --- |
| `/` Home | Daniel | Trimester timeline, Prep CTA, empty state |
| Onboarding form | Daniel | Writes patient profile (+ next appointment) |
| `/schedule`, `/schedule/book` | Omar | List + book with Tavily/fixture doc research |
| `/upload` | Omar | Targeted extract + save |
| `/prep` | Omar | Per-appointment checklist + readiness agent |
| `/library` | Omar | Document list + detail |
| `/demo` | Shared | Seed profiles |

## Runtime

| Mode | How |
| --- | --- |
| Cloud | Gemma via `GOOGLE_API_KEY` (`gemma-4-26b-a4b-it`) → OpenAI fallback → fixtures |
| Local | Ollama (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`) → fixture fallback |
| Research | `TAVILY_API_KEY` + Gemma structure → fixture fallback |

Copy [`thread-app/.env.example`](thread-app/.env.example) → `.env.local`.

Sample CareOS PDFs: [`thread-app/public/samples/`](thread-app/public/samples/).

## Data model

Outer shapes: patient profile, appointments (with `required_doc_ids` / `doc_reasons`), timeline entries, library docs. Persist in `localStorage` (`thread-app-state`). See PLAN.md and `thread-app/src/lib/types.ts`.

## Team split

| Person | Owns |
| --- | --- |
| **Daniel** | Onboarding form + Home timeline |
| **Omar** | Schedule, Upload, Prep, Library, extract, Tavily, readiness tools |

## Demo script (~2 min)

1. Load demo profile (or onboarding form)
2. Schedule → Book → research docs → confirm
3. Meeting Prep → Run readiness check
4. Upload sample PDF for a missing doc → extract → save
5. Library + Prep score update; disclaimer: decision-support / synthetic only

## Out of scope for MVP

- Accounts / login, live EHR, real calendar sync, voice input
- Full multi-turn chat agent (readiness uses a fixed tool loop)

## Dev

```bash
cd thread-app
npm install
npm run dev
```
