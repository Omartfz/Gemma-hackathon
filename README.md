# Pregnancy Continuity-of-Care App

## Problem
Pregnant patients see multiple providers over 9+ months — OB, midwife, specialists, labs.
Info gets lost between visits. Patients forget symptoms, don't know what's normal, walk into
appointments unprepared. This data is deeply private.

## Solution
Thread is an on-device web app that turns scattered visit documents and patient notes into
one continuous, private timeline. Gemma 4 runs locally to extract info, catch gaps, and prep
patients before every appointment — no health data ever leaves the device.

## Key Points
- Patient uploads visit documents (PDFs, photos of forms) over the course of pregnancy
- Gemma (on-device) parses each doc into structured fields; first doc also generates onboarding (profile + checklist + timeline scaffold)
- Flagged empty/off fields are reviewed and corrected inline by the patient
- All documents build one visual timeline, organized into trimester zones and by provider visit
- Meeting Prep surfaces gaps, required docs, and drafted questions — tied to current trimester stage
- 100% offline — zero network calls, provable live in demo
- Synthetic/public data only — decision-support only, never diagnosis

## Care Timeline Structure
Home page timeline is organized into 4 zones, each a section on the visual timeline
with its own nested documents:

1. **First Trimester (W1–W12):** Onboarding & Baseline
2. **Second Trimester (W13–W27):** Tracking & Screening
3. **Third Trimester (W28–W40):** Birth Plan & Admin Auth
4. **Postpartum Care (W41+ / 0–12 weeks post-birth):** Recovery & Newborn

Meeting Prep's required-docs checklist is tied to the current trimester/stage —
checklist contents change as the patient progresses through zones.

Demo data currently being generated for **Zone 1 (First Trimester)** first.

## Pages

### 1. Home
- Visual timeline (dots/line style), organized by provider visit
- Next appointment card
- "Prep for Next Appointment" button
- Nav to other pages
- Empty state handled here (before any docs uploaded)

### 2. Upload Docs
- Upload PDF or photo of document
- Gemma extracts structured fields
- Flags empty/off-looking fields
- User reviews and edits flagged fields inline before saving
- First upload also triggers onboarding: sets patient name, timeline anchor, provider info

### 3. Meeting Prep
- Required documents checklist for next visit
- Gaps/flags detected by Gemma (e.g. "BP monitoring mentioned, no readings logged since")
- Drafted questions to ask provider, generated from timeline history

### 4. Document Library
- List of all uploaded/generated documents
- Click to view/reopen (modal or expand, not a separate page)

## Data Model (lock this first, before splitting work)

Sample timeline entry — adjust fields once PM confirms actual sample PDFs:

```json
{
  "id": "entry_0001",
  "date": "2026-02-14",
  "trimester": "first",
  "type": "visit",
  "provider": {
    "name": "Dr. Sarah Chen",
    "role": "OB/GYN"
  },
  "category": "physical",
  "title": "12-Week Prenatal Checkup",
  "summary": "Routine checkup, blood pressure normal, weight on track.",
  "fields": {
    "blood_pressure": "118/76",
    "weight_lbs": 142,
    "fetal_heart_rate_bpm": 150,
    "next_appointment_recommended": "2026-03-14"
  },
  "flags": [
    {
      "field": "fetal_heart_rate_bpm",
      "issue": "missing_in_source",
      "resolved": false
    }
  ],
  "source_doc": {
    "doc_id": "doc_0001",
    "filename": "visit_summary_w12.pdf",
    "uploaded_at": "2026-02-14T10:30:00Z"
  }
}
```

**Field notes:**
- `id` — unique per entry, used for linking from Document Library
- `trimester` — auto-set from date vs. due date, or inferred from doc content
- `type` — visit / lab / referral / note (extend as needed per doc type)
- `fields` — flexible object, shape changes based on doc type (a lab result has different fields than a visit summary) — keep this loosely typed so it can flex per PDF
- `flags` — array so multiple issues per entry are possible; each resolved via inline edit in Upload Docs
- `source_doc` — links back to Document Library entry

**Document Library entry (separate object, referenced by source_doc):**
```json
{
  "doc_id": "doc_0001",
  "filename": "visit_summary_w12.pdf",
  "uploaded_at": "2026-02-14T10:30:00Z",
  "linked_entry_id": "entry_0001",
  "raw_text_extracted": "..."
}
```

Keep `fields` intentionally loose (flexible key-value) since exact structure depends on
whatever sample PDFs the PM uploads — lock the outer shape now, let `fields` evolve per doc type.

## Team Split (Daniel + Omar)

**Omar — UI/Pages**
- Onboarding flow: UI + animations
- Onboarding: plan display (checklist + timeline scaffold generated from first doc)
- Home page: visual timeline UI + nav
- Meeting Prep: full page (UI + display of gaps/checklist/questions from Daniel's Gemma logic)

**Daniel — Gemma + Document pages**
- Onboarding: Gemma logic that reads first uploaded doc → generates checklist + timeline scaffold
- Document Upload: UI + flow
- Document Upload: Gemma extraction + field-flagging (empty/off fields)
- Document Library: list + detail view
- Gemma gap-detection + question-generation logic (feeds Meeting Prep)

**Shared first task (~30 min):** Lock the timeline entry JSON schema together before splitting off.

## MVP Cut List (not in scope)
- No accounts/login
- No multi-user (partner/provider shared views) — mentioned as roadmap in pitch only
- No real scheduling/calendar integration
- No voice input unless time allows

## Demo Script (~2 min)
1. Show offline/airplane mode ON, visible throughout
2. Upload first synthetic document → onboarding profile auto-generates
3. Upload 1-2 more documents → timeline populates, one field flagged and corrected live
4. Go to Meeting Prep → show gap flag + drafted questions
5. Point back to offline indicator — "none of this touched a network"
