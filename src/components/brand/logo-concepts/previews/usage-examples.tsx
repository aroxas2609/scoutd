import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";
import type { LogoConceptId } from "@/components/brand/logo-concepts/types";
import { conceptRegistry } from "@/components/brand/logo-concepts/concept-registry";

type UsageExamplesProps = {
  conceptId: LogoConceptId;
};

export function UsageExamples({ conceptId }: UsageExamplesProps) {
  const { Wordmark, Mark } = conceptRegistry[conceptId];

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-white/40">Usage examples</p>

      {/* Auth-style */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ background: logoConceptColors.appDeep }}
      >
        <p className="mb-3 text-[10px] text-white/35">Auth header</p>
        <Wordmark size={40} theme="dark" />
      </div>

      {/* Welcome compact */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: logoConceptColors.black }}
      >
        <Wordmark size={26} theme="dark" />
        <span className="text-xs text-white/45">Sign in</span>
      </div>

      {/* Footer strip */}
      <div
        className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3"
        style={{ background: logoConceptColors.graphite }}
      >
        <Wordmark size={24} theme="dark" />
        <span className="text-[10px] text-white/35">© 2026</span>
      </div>

      {/* Mark-only compact */}
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
        <Mark size={28} theme="light" />
        <span className="text-sm font-semibold text-black">Scoutd</span>
        <span className="ml-auto text-[10px] text-black/40">Icon + label fallback</span>
      </div>
    </div>
  );
}
