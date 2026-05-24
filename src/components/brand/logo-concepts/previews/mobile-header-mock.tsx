import type { LogoConceptId } from "@/components/brand/logo-concepts/types";
import { conceptRegistry } from "@/components/brand/logo-concepts/concept-registry";
import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";

type MobileHeaderMockProps = {
  conceptId: LogoConceptId;
};

export function MobileHeaderMock({ conceptId }: MobileHeaderMockProps) {
  const { Wordmark } = conceptRegistry[conceptId];

  return (
    <div className="mx-auto w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-deep,#0b1020)] shadow-lg">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <Wordmark size={28} theme="dark" />
        <span className="text-xs text-white/50">Sign in</span>
      </div>
      <div className="space-y-2 px-4 py-4">
        <div className="h-2 w-2/3 rounded bg-white/10" />
        <div className="h-2 w-1/2 rounded bg-white/5" />
      </div>
      <p className="px-4 pb-3 text-[10px] text-white/35">Mobile header · ~36px wordmark</p>
    </div>
  );
}

export function MobileHeaderMockLight({ conceptId }: MobileHeaderMockProps) {
  const { Wordmark } = conceptRegistry[conceptId];

  return (
    <div
      className="mx-auto w-[280px] overflow-hidden rounded-2xl border shadow-lg"
      style={{ borderColor: "rgba(0,0,0,0.08)", background: logoConceptColors.white }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        <Wordmark size={28} theme="light" />
        <span className="text-xs text-black/45">Sign in</span>
      </div>
      <div className="space-y-2 px-4 py-4">
        <div className="h-2 w-2/3 rounded bg-black/10" />
        <div className="h-2 w-1/2 rounded bg-black/5" />
      </div>
    </div>
  );
}
