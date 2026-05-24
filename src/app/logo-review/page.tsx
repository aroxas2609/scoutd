import { notFound } from "next/navigation";
import { ConceptCard } from "@/components/brand/logo-concepts/previews/concept-card";
import { logoConceptColors, logoConceptGroups } from "@/components/brand/logo-concepts/tokens";
import type { LogoConceptId } from "@/components/brand/logo-concepts/types";

function ConceptSection({
  title,
  description,
  ids,
}: {
  title: string;
  description: string;
  ids: readonly LogoConceptId[];
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/50">{description}</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        {ids.map((id) => (
          <ConceptCard key={id} conceptId={id} />
        ))}
      </div>
    </section>
  );
}

export default function LogoReviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
      <div
        className="mb-10 rounded-xl border px-5 py-4"
        style={{
          borderColor: `${logoConceptColors.green}40`,
          background: `${logoConceptColors.green}08`,
        }}
      >
        <p className="text-sm font-medium" style={{ color: logoConceptColors.green }}>
          Review only — not live branding
        </p>
        <p className="mt-1 text-sm text-white/60">
          These concepts are isolated from the production app. Nothing here updates navigation,
          headers, PWA icons, or favicons. Approve an option before any implementation.
        </p>
        <p className="mt-2 text-xs text-white/40">
          Local URL: <code className="text-white/55">/logo-review</code> · Returns 404 in production
        </p>
      </div>

      <header className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Scoutd logo concepts</h1>
        <p className="mt-3 text-white/55">
          Four directions: two abstract &ldquo;S&rdquo; marks and two soccer-themed marks with a
          minimal geometric ball. Palette: black, graphite, white, electric green (
          <span style={{ color: logoConceptColors.green }}>{logoConceptColors.green}</span>
          ). Compare at 32px and 48px before approving.
        </p>
      </header>

      <div className="space-y-16">
        <ConceptSection
          title="Abstract S marks"
          description="Original concepts — motion and connection without literal football imagery."
          ids={logoConceptGroups.abstract}
        />
        <ConceptSection
          title="Soccer-themed marks"
          description="Revised direction — minimal ball integrated into the mark. Geometric panels only, not clipart."
          ids={logoConceptGroups.soccer}
        />
      </div>

      <section
        className="mt-12 rounded-2xl border border-white/[0.08] p-8 text-center"
        style={{ background: logoConceptColors.graphite }}
      >
        <h2 className="text-lg font-semibold">Ready to choose?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
          Reply with one of the following — no logo will be added to the app until you approve:
        </p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-white/70">
          <li>
            <strong className="text-white">Approve Option A</strong> — Velocity
          </li>
          <li>
            <strong className="text-white">Approve Option B</strong> — Signal
          </li>
          <li>
            <strong className="text-white">Approve Option C</strong> — Orbit (soccer)
          </li>
          <li>
            <strong className="text-white">Approve Option D</strong> — Strike (soccer)
          </li>
          <li>
            <strong className="text-white">Revise</strong> — share notes for another round
          </li>
        </ul>
      </section>
    </main>
  );
}
