"use client";

import { Loader2 } from "lucide-react";
import { useAssociationSuggestion } from "@/features/associations/hooks";
import { isValidAustralianPostcode } from "@/lib/football/association-postcodes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DistrictSuggestionBannerProps = {
  postcode: string;
  /** Player: association UUID; coach: league name */
  currentDistrictValue?: string;
  onAccept: (suggestion: { associationId: string; associationName: string }) => void;
  className?: string;
};

export function DistrictSuggestionBanner({
  postcode,
  currentDistrictValue,
  onAccept,
  className,
}: DistrictSuggestionBannerProps) {
  const enabled = isValidAustralianPostcode(postcode);
  const { data: suggestion, isFetching, isPending } = useAssociationSuggestion(
    enabled ? postcode : null
  );

  if (!enabled) return null;

  const loading = isPending || isFetching;
  const matchesCurrent =
    suggestion &&
    currentDistrictValue &&
    (currentDistrictValue === suggestion.associationId ||
      currentDistrictValue === suggestion.associationName);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[var(--bg-surface)] px-3 py-2.5 text-sm",
        className
      )}
    >
      {loading ? (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Checking district…
        </p>
      ) : suggestion ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-foreground/90">
            Suggested district:{" "}
            <span className="font-medium text-foreground">{suggestion.associationName}</span>
          </p>
          {!matchesCurrent ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-white/15 bg-transparent"
              onClick={() => onAccept(suggestion)}
            >
              Use suggestion
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">District selected</span>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No district found for this postcode. You can select one manually.
        </p>
      )}
    </div>
  );
}
