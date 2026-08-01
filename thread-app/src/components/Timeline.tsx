import type { PatientProfile, TimelineEntry } from "@/lib/types";
import {
  getCurrentGestationalWeek,
  getZoneStatus,
  groupEntriesByZone,
  TIMELINE_ZONES,
  ZONE_COLORS,
  type ZoneConfig,
  type ZoneStatus,
} from "@/lib/timeline";

type Row =
  | { kind: "zone"; zone: ZoneConfig; status: ZoneStatus; currentWeek: number }
  | { kind: "entry"; zone: ZoneConfig; entry: TimelineEntry }
  | { kind: "empty"; zone: ZoneConfig; status: ZoneStatus };

function buildRows(entries: TimelineEntry[], currentWeek: number): Row[] {
  const byZone = groupEntriesByZone(entries);
  const rows: Row[] = [];

  for (const zone of TIMELINE_ZONES) {
    const status = getZoneStatus(zone, currentWeek);
    rows.push({ kind: "zone", zone, status, currentWeek });

    const zoneEntries = byZone[zone.id];
    if (zoneEntries.length === 0) {
      rows.push({ kind: "empty", zone, status });
    } else {
      for (const entry of zoneEntries) {
        rows.push({ kind: "entry", zone, entry });
      }
    }
  }

  return rows;
}

function rowStatus(row: Row): ZoneStatus {
  return row.kind === "entry" ? "current" : row.status;
}

function StatusPill({ status }: { status: ZoneStatus }) {
  if (status === "complete") {
    return (
      <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--ink)]">
        Complete
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
        Upcoming
      </span>
    );
  }
  return null;
}

function ZoneRowContent({
  zone,
  status,
  currentWeek,
}: {
  zone: ZoneConfig;
  status: ZoneStatus;
  currentWeek: number;
}) {
  const color = ZONE_COLORS[zone.id];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
      <h3
        className="text-xl font-semibold tracking-tight text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {zone.label}
      </h3>
      <span className="text-sm text-[var(--muted)]">{zone.weekRange}</span>
      <span className="text-sm text-[var(--muted)]">· {zone.subtitle}</span>
      {status === "current" ? (
        <span
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ background: color.soft, color: color.solid }}
        >
          <span className="relative inline-flex h-2 w-2">
            <span className="zone-pulse absolute inline-flex h-2 w-2" style={{ color: color.solid }} />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: color.solid }}
            />
          </span>
          You are here · Week {currentWeek}
        </span>
      ) : (
        <span className="ml-auto">
          <StatusPill status={status} />
        </span>
      )}
    </div>
  );
}

function EntryRowContent({ entry }: { entry: TimelineEntry }) {
  const activeFlags = entry.flags.filter((f) => !f.resolved);
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium text-[var(--ink)]">{entry.title}</p>
        <p className="shrink-0 text-xs text-[var(--muted)]">{entry.date}</p>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {entry.provider.name} · {entry.provider.role}
      </p>
      <p className="mt-2 text-sm text-[var(--ink)]">{entry.summary}</p>
      {activeFlags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {activeFlags.map((flag) => (
            <li
              key={flag.field}
              className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--ink)]"
            >
              Needs follow-up: {flag.field.replaceAll("_", " ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyRowContent({ status }: { status: ZoneStatus }) {
  return (
    <p className="text-sm text-[var(--muted)]">
      {status === "upcoming" ? "Not started yet." : "No documents logged for this stage yet."}
    </p>
  );
}

function Dot({ row }: { row: Row }) {
  const color = ZONE_COLORS[row.zone.id];

  if (row.kind === "zone") {
    return (
      <span
        className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
        style={{
          background: row.status === "upcoming" ? "var(--surface)" : color.solid,
          border: row.status === "upcoming" ? `2px solid ${color.solid}` : undefined,
          boxShadow: `0 0 0 4px ${color.soft}`,
        }}
      />
    );
  }

  if (row.kind === "entry") {
    return (
      <span
        className="relative z-10 mt-2 h-2 w-2 shrink-0 rounded-full"
        style={{ background: color.solid }}
      />
    );
  }

  return (
    <span
      className="relative z-10 mt-2 h-2 w-2 shrink-0 rounded-full border border-dashed"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    />
  );
}

export function Timeline({
  profile,
  entries,
}: {
  profile: PatientProfile;
  entries: TimelineEntry[];
}) {
  const currentWeek = getCurrentGestationalWeek(profile);
  const rows = buildRows(entries, currentWeek);

  return (
    <ol className="relative">
      {rows.map((row, i) => {
        const status = rowStatus(row);
        const lineColor = status === "upcoming" ? "var(--border)" : ZONE_COLORS[row.zone.id].solid;
        const lineStyle = status === "upcoming" ? "dashed" : "solid";
        const key =
          row.kind === "entry" ? `entry-${row.entry.id}` : `${row.kind}-${row.zone.id}`;

        return (
          <li key={key} className="grid grid-cols-[1.75rem_1fr] gap-x-4">
            <div className="relative flex justify-center">
              {i !== 0 && (
                <span
                  className="absolute left-1/2 top-0 h-1/2 border-l"
                  style={{ borderColor: lineColor, borderLeftStyle: lineStyle }}
                />
              )}
              {i !== rows.length - 1 && (
                <span
                  className="absolute left-1/2 bottom-0 h-1/2 border-l"
                  style={{ borderColor: lineColor, borderLeftStyle: lineStyle }}
                />
              )}
              <Dot row={row} />
            </div>
            <div className={row.kind === "zone" ? "pb-4" : "pb-6"}>
              {row.kind === "zone" && (
                <ZoneRowContent zone={row.zone} status={row.status} currentWeek={row.currentWeek} />
              )}
              {row.kind === "entry" && <EntryRowContent entry={row.entry} />}
              {row.kind === "empty" && <EmptyRowContent status={row.status} />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
