import { ZONE1_REQUIRED_DOCS } from "./checklist-zone1";
import type { Appointment, AppState } from "./types";

export const STORAGE_KEY = "thread-app-state";

export const defaultState = (): AppState => ({
  profile: null,
  appointments: [],
  entries: [],
  documents: [],
  gemmaMode: "cloud",
  readinessScore: null,
});

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Build a Zone 1 appointment from the profile's next visit. */
export function appointmentFromProfile(
  profile: NonNullable<AppState["profile"]>,
  id = "appt_next",
): Appointment {
  return {
    id,
    date: profile.next_appointment.date,
    title: profile.next_appointment.title,
    provider: profile.provider,
    required_doc_ids: ZONE1_REQUIRED_DOCS.map((d) => d.id),
  };
}

/**
 * If appointments are empty but profile has a next visit, seed one Zone 1 appointment.
 * Persists when storage is available.
 */
export function ensureAppointments(state: AppState): AppState {
  if (state.appointments.length > 0 || !state.profile) return state;
  const next: AppState = {
    ...state,
    appointments: [appointmentFromProfile(state.profile)],
  };
  saveState(next);
  return next;
}

export function loadState(): AppState {
  if (!canUseStorage()) return defaultState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = defaultState();
    const state: AppState = {
      ...base,
      ...parsed,
      appointments: Array.isArray(parsed.appointments)
        ? parsed.appointments
        : base.appointments,
      entries: Array.isArray(parsed.entries) ? parsed.entries : base.entries,
      documents: Array.isArray(parsed.documents) ? parsed.documents : base.documents,
      profile: parsed.profile ?? base.profile,
      gemmaMode: parsed.gemmaMode === "local" ? "local" : "cloud",
      readinessScore:
        typeof parsed.readinessScore === "number" || parsed.readinessScore === null
          ? (parsed.readinessScore ?? null)
          : base.readinessScore,
    };
    return ensureAppointments(state);
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(updater: (prev: AppState) => AppState): AppState {
  const next = updater(loadState());
  saveState(next);
  return next;
}
