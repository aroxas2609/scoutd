import { logoConceptColors, logoConceptLabels } from "@/components/brand/logo-concepts/tokens";
import type { LogoConceptId } from "@/components/brand/logo-concepts/types";
import { conceptRegistry } from "@/components/brand/logo-concepts/concept-registry";
import { BackgroundSwatch } from "./background-swatch";
import { MobileHeaderMock, MobileHeaderMockLight } from "./mobile-header-mock";
import { DesktopNavMock } from "./desktop-nav-mock";
import { PwaIconMock } from "./pwa-icon-mock";
import { UsageExamples } from "./usage-examples";

type ConceptCardProps = {
  conceptId: LogoConceptId;
};

export function ConceptCard({ conceptId }: ConceptCardProps) {
  const meta = logoConceptLabels[conceptId];
  const { Mark, Wordmark } = conceptRegistry[conceptId];

  return (
    <article className="space-y-8 rounded-2xl border border-white/[0.08] bg-[#121a2b] p-6 lg:p-8">
      <header>
        <h2 className="text-xl font-semibold text-white">{meta.name}</h2>
        <p className="mt-1 text-sm text-white/50">{meta.tagline}</p>
      </header>

      {/* Icon-only */}
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">Icon-only mark</h3>
        <div className="flex flex-wrap items-end gap-8">
          <Mark size={80} theme="dark" />
          <div className="flex items-center gap-4">
            <Mark size={32} theme="dark" />
            <Mark size={24} theme="dark" />
            <Mark size={16} theme="dark" />
          </div>
          <span className="text-[10px] text-white/35">80px · 32 · 24 · 16</span>
        </div>
      </section>

      {/* Horizontal wordmark */}
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">
          Horizontal wordmark
        </h3>
        <Wordmark size={44} theme="dark" />
      </section>

      {/* Backgrounds */}
      <section className="grid gap-4 sm:grid-cols-3">
        <BackgroundSwatch label="Dark" background={logoConceptColors.black} theme="dark">
          <Wordmark size={32} theme="dark" />
        </BackgroundSwatch>
        <BackgroundSwatch label="App navy fit" background={logoConceptColors.appDeep} theme="dark" border>
          <Wordmark size={32} theme="dark" />
        </BackgroundSwatch>
        <BackgroundSwatch label="Light" background={logoConceptColors.white} theme="light">
          <Wordmark size={32} theme="light" />
        </BackgroundSwatch>
      </section>

      {/* PWA */}
      <section className="space-y-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">App icon sizes</h3>
        <PwaIconMock conceptId={conceptId} />
      </section>

      {/* Mockups */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">
            Mobile header
          </h3>
          <MobileHeaderMock conceptId={conceptId} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">
            Desktop nav
          </h3>
          <DesktopNavMock conceptId={conceptId} />
        </div>
      </section>

      <UsageExamples conceptId={conceptId} />

      <div className="rounded-lg border border-dashed border-white/10 px-4 py-3 text-center text-xs text-white/40">
        Light mobile preview
      </div>
      <MobileHeaderMockLight conceptId={conceptId} />
    </article>
  );
}
