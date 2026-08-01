"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getCurrentZone, ZONE_HEX } from "@/lib/timeline";

const GrowthOrb = dynamic(() => import("@/components/GrowthOrb").then((m) => m.GrowthOrb), {
  ssr: false,
  loading: () => <OrbPlaceholder />,
});

function OrbPlaceholder() {
  return <div className="h-full w-full animate-pulse bg-[var(--accent-soft)]" />;
}

export function GrowthOrbCard({ week }: { week: number }) {
  const zone = getCurrentZone(week);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="h-64 w-full">
        <ErrorBoundary fallback={<OrbPlaceholder />}>
          <GrowthOrb week={week} color={ZONE_HEX[zone.id]} />
        </ErrorBoundary>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">
            Growth visualization · Week {week}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Stylized illustration, not a medical image — drag to rotate.
          </p>
        </div>
      </div>
    </div>
  );
}
