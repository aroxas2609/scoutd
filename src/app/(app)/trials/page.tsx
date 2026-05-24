"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { TrialListItem } from "@/components/trials/trial-list-item";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageLoader } from "@/components/ui/page-loader";
import { useTrials, useTrialsRealtime, type TrialInboxFilter } from "@/features/trials/hooks";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { Calendar } from "lucide-react";
import { EmptyStateCinematic } from "@/components/ui/empty-state";

export default function TrialsPage() {
  const [inboxFilter, setInboxFilter] = useState<TrialInboxFilter>("active");
  useTrialsRealtime();
  const { data: trials, isLoading } = useTrials(inboxFilter);
  const { isPlayer } = useIsCoachViewer();

  const archivedCount = inboxFilter === "archived" ? (trials?.length ?? 0) : 0;

  return (
    <div>
      <AppHeader title="Trials" subtitle="Invitations & schedules" />
      <div className="space-y-4 px-4 pb-8">
        <SegmentedControl
          value={inboxFilter}
          onChange={setInboxFilter}
          segments={[
            { value: "active", label: "Inbox" },
            {
              value: "archived",
              label:
                inboxFilter === "archived" && archivedCount > 0
                  ? `Archived (${archivedCount})`
                  : "Archived",
            },
          ]}
        />

        {isLoading ? (
          <PageLoader />
        ) : !trials?.length ? (
          <EmptyStateCinematic
            icon={<Calendar className="h-6 w-6" />}
            title={inboxFilter === "archived" ? "No archived trials" : "No trials scheduled"}
            description={
              inboxFilter === "archived"
                ? "Archived invites will appear here."
                : "Trial invites from coaches will appear here."
            }
          />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {trials.map((t) => (
              <TrialListItem
                key={t.id}
                trial={t}
                inboxFilter={inboxFilter}
                isPlayerViewer={isPlayer}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
