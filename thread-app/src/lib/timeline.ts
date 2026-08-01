import type { PatientProfile, TimelineEntry } from "./types";

export type ZoneId = TimelineEntry["trimester"];
export type ZoneStatus = "complete" | "current" | "upcoming";

export type ZoneConfig = {
  id: ZoneId;
  label: string;
  weekRange: string;
  subtitle: string;
  minWeek: number;
  maxWeek: number;
};

export const TIMELINE_ZONES: ZoneConfig[] = [
  {
    id: "first",
    label: "First Trimester",
    weekRange: "W1–W12",
    subtitle: "Onboarding & Baseline",
    minWeek: 1,
    maxWeek: 12,
  },
  {
    id: "second",
    label: "Second Trimester",
    weekRange: "W13–W27",
    subtitle: "Tracking & Screening",
    minWeek: 13,
    maxWeek: 27,
  },
  {
    id: "third",
    label: "Third Trimester",
    weekRange: "W28–W40",
    subtitle: "Birth Plan & Admin",
    minWeek: 28,
    maxWeek: 40,
  },
  {
    id: "postpartum",
    label: "Postpartum Care",
    weekRange: "W41+",
    subtitle: "Recovery & Newborn",
    minWeek: 41,
    maxWeek: Infinity,
  },
];

/** Validated categorical palette for the 4 zones — see globals.css for the CSS vars. */
export const ZONE_COLORS: Record<ZoneId, { solid: string; soft: string }> = {
  first: { solid: "var(--zone-first)", soft: "var(--zone-first-soft)" },
  second: { solid: "var(--zone-second)", soft: "var(--zone-second-soft)" },
  third: { solid: "var(--zone-third)", soft: "var(--zone-third-soft)" },
  postpartum: { solid: "var(--zone-postpartum)", soft: "var(--zone-postpartum-soft)" },
};

/**
 * Same palette as ZONE_COLORS, as raw hex. WebGL materials (Three.js `Color`)
 * can't resolve CSS custom properties, so anything rendered on a <canvas>
 * needs this instead of the --zone-* vars.
 */
export const ZONE_HEX: Record<ZoneId, string> = {
  first: "#1f8a4c",
  second: "#c98a12",
  third: "#b83d6b",
  postpartum: "#6a4f8f",
};

export function getCurrentZone(currentWeek: number): ZoneConfig {
  return (
    TIMELINE_ZONES.find((zone) => currentWeek >= zone.minWeek && currentWeek <= zone.maxWeek) ??
    TIMELINE_ZONES[TIMELINE_ZONES.length - 1]
  );
}

const WEEKS_AT_TERM = 40;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Current week is derived from due_date vs today, not the gestational week
 * captured at the last document upload — so the timeline keeps advancing
 * even between uploads.
 */
export function getCurrentGestationalWeek(profile: PatientProfile): number {
  if (profile.due_date) {
    const due = new Date(profile.due_date);
    if (!Number.isNaN(due.getTime())) {
      const weeksUntilDue = (due.getTime() - Date.now()) / MS_PER_WEEK;
      return Math.max(1, Math.round(WEEKS_AT_TERM - weeksUntilDue));
    }
  }
  return profile.gestational_week || 1;
}

export function getZoneStatus(zone: ZoneConfig, currentWeek: number): ZoneStatus {
  if (currentWeek > zone.maxWeek) return "complete";
  if (currentWeek >= zone.minWeek) return "current";
  return "upcoming";
}

export function groupEntriesByZone(entries: TimelineEntry[]): Record<ZoneId, TimelineEntry[]> {
  const grouped: Record<ZoneId, TimelineEntry[]> = {
    first: [],
    second: [],
    third: [],
    postpartum: [],
  };
  for (const entry of entries) {
    grouped[entry.trimester].push(entry);
  }
  return grouped;
}
