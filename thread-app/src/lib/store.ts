import type { AppState } from "./types";

export const STORAGE_KEY = "thread-app-state";

export const defaultState = (): AppState => ({
  profile: null,
  entries: [],
  documents: [],
  gemmaMode: "cloud",
  readinessScore: null,
});

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadState(): AppState {
  if (!canUseStorage()) return defaultState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      entries: Array.isArray(parsed.entries) ? parsed.entries : base.entries,
      documents: Array.isArray(parsed.documents) ? parsed.documents : base.documents,
      profile: parsed.profile ?? base.profile,
      gemmaMode: parsed.gemmaMode === "local" ? "local" : "cloud",
      readinessScore:
        typeof parsed.readinessScore === "number" || parsed.readinessScore === null
          ? (parsed.readinessScore ?? null)
          : base.readinessScore,
    };
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
