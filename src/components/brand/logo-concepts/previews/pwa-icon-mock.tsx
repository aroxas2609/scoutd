import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";
import type { LogoConceptId } from "@/components/brand/logo-concepts/types";
import { conceptRegistry } from "@/components/brand/logo-concepts/concept-registry";

type PwaIconMockProps = {
  conceptId: LogoConceptId;
};

function IconTile({
  size,
  label,
  children,
}: {
  size: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center rounded-[22%] shadow-md"
        style={{
          width: size,
          height: size,
          background: logoConceptColors.graphite,
        }}
      >
        {children}
      </div>
      <span className="text-[10px] text-white/40">{label}</span>
    </div>
  );
}

export function PwaIconMock({ conceptId }: PwaIconMockProps) {
  const { Mark } = conceptRegistry[conceptId];
  const iconPadding = 0.22;

  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      <IconTile size={48} label="48px">
        <Mark size={Math.round(48 * (1 - iconPadding * 2))} theme="dark" />
      </IconTile>
      <IconTile size={96} label="96px preview">
        <Mark size={Math.round(96 * (1 - iconPadding * 2))} theme="dark" />
      </IconTile>
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex items-center justify-center rounded-[22%] shadow-lg ring-1 ring-white/10"
          style={{
            width: 120,
            height: 120,
            background: logoConceptColors.graphite,
          }}
        >
          <Mark size={72} theme="dark" />
        </div>
        <span className="text-[10px] text-white/40">192px frame</span>
      </div>
    </div>
  );
}
