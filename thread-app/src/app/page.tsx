import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
        Daniel · Home + Onboarding
      </p>
      <h1
        className="mt-2 text-4xl font-semibold tracking-tight text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        Thread
      </h1>
      <p className="mt-3 max-w-xl text-lg text-[var(--muted)]">
        Shared foundation is ready. Build onboarding and the care timeline here —
        read/write{" "}
        <code className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-sm text-[var(--ink)]">
          @/lib/store
        </code>{" "}
        and types from{" "}
        <code className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-sm text-[var(--ink)]">
          @/lib/types
        </code>
        .
      </p>

      <ul className="mt-8 space-y-2 text-[var(--ink)]">
        <li>
          · Onboarding form → write <code className="text-sm">profile</code> into
          the store
        </li>
        <li>· Home timeline → read <code className="text-sm">entries</code></li>
        <li>
          · Prep CTA → read <code className="text-sm">readinessScore</code> (Omar
          fills later)
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/upload"
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm text-[var(--surface)]"
        >
          Omar: Upload stub
        </Link>
        <Link
          href="/prep"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Meeting Prep stub
        </Link>
        <Link
          href="/library"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--ink)]"
        >
          Library stub
        </Link>
      </div>
    </main>
  );
}
