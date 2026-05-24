import type { LogoConceptId } from "@/components/brand/logo-concepts/types";
import { conceptRegistry } from "@/components/brand/logo-concepts/concept-registry";
import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";

type DesktopNavMockProps = {
  conceptId: LogoConceptId;
};

const navItems = ["Discover", "Search", "Messages", "Trials"];

export function DesktopNavMock({ conceptId }: DesktopNavMockProps) {
  const { Wordmark } = conceptRegistry[conceptId];

  return (
    <div className="flex h-[220px] w-full max-w-[320px] overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]">
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-white/[0.06] px-4 py-4">
        <Wordmark size={34} theme="dark" />
        <nav className="mt-6 space-y-1">
          {navItems.map((item, i) => (
            <div
              key={item}
              className={`rounded-lg px-2.5 py-2 text-xs ${
                i === 1
                  ? "bg-[#00e0b8]/12 font-medium text-[#00e0b8]"
                  : "text-white/45"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
        <p className="mt-auto text-[10px] text-white/30">Desktop sidebar · ~40px</p>
      </aside>
      <div className="flex-1 bg-[#121a2b] p-4">
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="mt-3 h-2 w-3/4 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function DesktopNavMockLight({ conceptId }: DesktopNavMockProps) {
  const { Wordmark } = conceptRegistry[conceptId];

  return (
    <div
      className="flex h-[220px] w-full max-w-[320px] overflow-hidden rounded-xl border shadow-sm"
      style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f8f9fb" }}
    >
      <aside
        className="flex w-[200px] shrink-0 flex-col border-r px-4 py-4"
        style={{ borderColor: "rgba(0,0,0,0.06)", background: logoConceptColors.white }}
      >
        <Wordmark size={34} theme="light" />
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <div key={item} className="rounded-lg px-2.5 py-2 text-xs text-black/40">
              {item}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-[#eef1f6] p-4">
        <div className="h-3 w-1/2 rounded bg-black/10" />
      </div>
    </div>
  );
}
