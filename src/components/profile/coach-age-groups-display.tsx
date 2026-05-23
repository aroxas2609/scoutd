import { groupSelectedAgeGroups } from "@/lib/football/age-groups";
import { cn } from "@/lib/utils";

type CoachAgeGroupsDisplayProps = {
  codes: string[];
  className?: string;
};

export function CoachAgeGroupsDisplay({ codes, className }: CoachAgeGroupsDisplayProps) {
  const { grouped, legacy } = groupSelectedAgeGroups(codes);
  if (!grouped.length && !legacy.length) return null;

  return (
    <div className={cn("space-y-3.5", className)}>
      {grouped.map(({ category, groups }) => (
        <div key={category}>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((group) => (
              <span
                key={group.code}
                title={group.label}
                className="inline-flex min-w-[2.75rem] items-center justify-center rounded-md border border-white/[0.08] bg-[var(--bg-deep)] px-2 py-1 text-xs font-semibold tabular-nums text-foreground"
              >
                {group.code}
              </span>
            ))}
          </div>
        </div>
      ))}
      {legacy.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Other
          </p>
          <div className="flex flex-wrap gap-1.5">
            {legacy.map((code) => (
              <span
                key={code}
                className="inline-flex min-w-[2.75rem] items-center justify-center rounded-md border border-white/[0.08] bg-[var(--bg-deep)] px-2 py-1 text-xs font-medium"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
