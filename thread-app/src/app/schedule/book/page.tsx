"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { newAppointmentId } from "@/lib/ids";
import { loadState, updateState } from "@/lib/store";
import type {
  Appointment,
  ResearchDocItem,
  ResearchDocsResponse,
} from "@/lib/types";

const APPOINTMENT_TYPES = [
  { value: "prenatal_checkup", label: "Prenatal checkup" },
  { value: "dating_ultrasound", label: "Dating ultrasound" },
  { value: "anatomy_scan", label: "Anatomy scan" },
  { value: "labs", label: "Labs / bloodwork visit" },
  { value: "other", label: "Other" },
] as const;

export default function BookAppointmentPage() {
  const router = useRouter();
  const [appointmentType, setAppointmentType] = useState("prenatal_checkup");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerRole, setProviderRole] = useState("OB/GYN");
  const [gestationalWeek, setGestationalWeek] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchDocsResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const profile = loadState().profile;
    if (profile) {
      setProviderName(profile.provider.name);
      setProviderRole(profile.provider.role);
      setGestationalWeek(String(profile.gestational_week));
      if (profile.next_appointment?.date) {
        setDate(profile.next_appointment.date);
      }
    }
  }, []);

  async function onResearch() {
    setLoading(true);
    setError(null);
    setResearch(null);
    try {
      const res = await fetch("/api/research-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_type: appointmentType,
          location: location || undefined,
          provider_role: providerRole || undefined,
          gestational_week: gestationalWeek
            ? Number(gestationalWeek)
            : undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Research failed (${res.status})`);
      const data = (await res.json()) as ResearchDocsResponse;
      setResearch(data);
      setSelectedIds(data.required.map((r) => r.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleDoc(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onConfirm() {
    if (!date.trim() || !providerName.trim() || !research) return;
    const typeLabel =
      APPOINTMENT_TYPES.find((t) => t.value === appointmentType)?.label ??
      appointmentType;
    const chosen = research.required.filter((r) => selectedIds.includes(r.id));
    if (chosen.length === 0) {
      setError("Select at least one required document.");
      return;
    }

    const doc_reasons = Object.fromEntries(
      chosen.map((r) => [r.id, r.reason]),
    );

    const appt: Appointment = {
      id: newAppointmentId(),
      date: date.trim(),
      title: typeLabel,
      provider: {
        name: providerName.trim(),
        role: providerRole.trim() || "Provider",
      },
      required_doc_ids: chosen.map((r) => r.id),
      location: location.trim() || undefined,
      appointment_type: appointmentType,
      notes: notes.trim() || undefined,
      status: "upcoming",
      doc_reasons,
      research_citations: research.citations,
    };

    updateState((prev) => ({
      ...prev,
      appointments: [...prev.appointments, appt],
      profile: prev.profile
        ? {
            ...prev.profile,
            next_appointment: {
              date: appt.date,
              title: appt.title,
            },
            provider: appt.provider,
          }
        : prev.profile,
    }));

    router.push("/schedule");
  }

  const fieldClass =
    "rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Book
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        Book appointment
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Tell us the visit details. We will research which documents you typically
        need (public sources / fixtures — not medical advice).
      </p>

      <div className="mt-8 grid max-w-xl gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Appointment type
          <select
            className={fieldClass}
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
          >
            {APPOINTMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Date
          <input
            type="date"
            className={fieldClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Location / clinic
          <input
            className={fieldClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Riverside Women’s Health"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Provider name
          <input
            className={fieldClass}
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Provider role
          <input
            className={fieldClass}
            value={providerRole}
            onChange={(e) => setProviderRole(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Gestational week
          <input
            type="number"
            min={1}
            max={42}
            className={fieldClass}
            value={gestationalWeek}
            onChange={(e) => setGestationalWeek(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink)]">
          Notes
          <textarea
            className={fieldClass}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to remember for this visit"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading || !date || !providerName}
            onClick={onResearch}
            className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)] disabled:opacity-40"
          >
            {loading ? "Researching…" : "Research documents"}
          </button>
          <Link
            href="/schedule"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
          >
            Cancel
          </Link>
        </div>

        {error ? <p className="text-sm text-[#6b3f2a]">{error}</p> : null}
      </div>

      {research ? (
        <section className="mt-10 max-w-xl">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Suggested documents
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Source: {research.source}
          </p>
          <ul className="mt-4 divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
            {research.required.map((doc: ResearchDocItem) => (
              <li key={doc.id} className="flex gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedIds.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                />
                <div>
                  <p className="font-medium text-[var(--ink)]">{doc.label}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Why: {doc.reason}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {research.citations.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Citations
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                {research.citations.map((c) => (
                  <li key={c.url}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onConfirm}
            className="mt-6 rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)]"
          >
            Confirm & save appointment
          </button>
        </section>
      ) : null}
    </main>
  );
}
