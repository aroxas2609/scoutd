"use client";

import { useEffect, useState, useTransition } from "react";
import { Calendar, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrialScheduleFields } from "@/components/forms/trial-schedule-fields";
import {
  ProfileFormField,
  profileFieldClass,
  profileTextareaClass,
} from "@/components/profile/profile-form-primitives";
import { createTrialInvite } from "@/features/trials/actions";
import { profileActionClass } from "@/components/profile/player-profile-action-styles";
import {
  combineLocalDateAndTime,
  defaultTrialDate,
  defaultTrialTime,
} from "@/lib/trials/schedule";
import { cn } from "@/lib/utils";

type TrialInviteDialogProps = {
  playerId: string;
  layout?: "default" | "profile";
};

const emptyForm = () => ({
  date: defaultTrialDate(),
  time: defaultTrialTime(),
  location: "",
  notes: "",
});

export function TrialInviteDialog({
  playerId,
  layout = "default",
}: TrialInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setScheduleError(null);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const scheduledAt = combineLocalDateAndTime(form.date, form.time);
    if (!scheduledAt) {
      setScheduleError("Choose a valid date and time");
      return;
    }
    setScheduleError(null);

    const formData = new FormData();
    formData.set("playerId", playerId);
    formData.set("scheduledAt", scheduledAt);
    formData.set("location", form.location.trim());
    formData.set("notes", form.notes.trim());

    if (!form.location.trim()) {
      toast.error("Add a trial location");
      return;
    }

    startTransition(async () => {
      const result = await createTrialInvite(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Trial invite sent");
      setOpen(false);
    });
  }

  const isProfile = layout === "profile";

  return (
    <Sheet open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          isProfile
            ? profileActionClass("primary")
            : "flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-white/90 active:scale-[0.99]"
        )}
      >
        <Calendar className={cn(isProfile ? "h-[18px] w-[18px]" : "h-4 w-4")} />
        Trial
      </button>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[min(90dvh,640px)] flex-col gap-0 rounded-t-3xl border-white/10 bg-[var(--bg-graphite)] p-0"
      >
        <div className="flex shrink-0 justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>

        <SheetHeader className="shrink-0 space-y-1.5 border-b border-white/[0.06] px-4 pb-4 pt-1 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-brand)]/15 text-[var(--accent-brand)]">
              <Calendar className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <SheetTitle className="font-display text-xl leading-tight">
                Invite to trial
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Send date, time, and location. The player can accept or decline from
                Trials or Messages.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-3">
              <TrialScheduleFields
                date={form.date}
                time={form.time}
                onDateChange={(date) => setForm((f) => ({ ...f, date }))}
                onTimeChange={(time) => setForm((f) => ({ ...f, time }))}
                dateError={scheduleError ?? undefined}
                timeError={scheduleError ?? undefined}
              />
              {scheduleError ? (
                <p className="text-xs text-red-400">{scheduleError}</p>
              ) : null}
            </section>

            <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-3">
              <ProfileFormField label="Location">
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    name="location"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Jensen Park, South Granville"
                    required
                    className={cn(profileFieldClass, "pl-10")}
                  />
                </div>
              </ProfileFormField>

              <ProfileFormField
                label="Notes"
                hint="Optional — kit colour, what to bring, parking"
              >
                <div className="relative">
                  <FileText
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Textarea
                    name="notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Share anything helpful before the session"
                    rows={3}
                    className={cn(profileTextareaClass, "min-h-[88px] pl-10")}
                  />
                </div>
              </ProfileFormField>
            </section>
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t border-white/[0.06] bg-[var(--bg-graphite)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <PremiumButton
              type="button"
              variant="outline"
              className="w-full sm:flex-1"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </PremiumButton>
            <PremiumButton type="submit" className="w-full sm:flex-1" disabled={pending}>
              {pending ? "Sending…" : "Send invite"}
            </PremiumButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
