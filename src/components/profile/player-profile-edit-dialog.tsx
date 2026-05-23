"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  playerOnboardingSchema,
  type PlayerOnboardingInput,
} from "@/features/onboarding/schemas";
import { updatePlayerProfile } from "@/features/profile/actions";
import { playerProfileToForm } from "@/features/profile/mappers";
import type { PlayerProfile } from "@/types/database";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ProfileFormField,
  ProfileFormSection,
  ProfileFormSelect,
  ProfileFormYesNo,
  profileFieldClass,
  profileTextareaClass,
} from "@/components/profile/profile-form-primitives";
interface PlayerProfileEditDialogProps {
  player: PlayerProfile;
}

const FOOT_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
];

const EXPERIENCE_OPTIONS = [
  { value: "academy", label: "Academy" },
  { value: "amateur", label: "Amateur" },
  { value: "semi_pro", label: "Semi-pro" },
  { value: "professional", label: "Professional" },
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "open_to_offers", label: "Open to offers" },
  { value: "not_available", label: "Not available" },
];

export function PlayerProfileEditDialog({ player }: PlayerProfileEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const form = useForm<PlayerOnboardingInput>({
    resolver: zodResolver(playerOnboardingSchema),
    defaultValues: playerProfileToForm(player),
  });

  useEffect(() => {
    if (open) {
      form.reset(playerProfileToForm(player));
    }
  }, [open, player, form]);

  async function onSubmit(data: PlayerOnboardingInput) {
    setSaving(true);
    const result = await updatePlayerProfile(data);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated");
    await qc.invalidateQueries({ queryKey: ["player", player.user_id] });
    await qc.invalidateQueries({ queryKey: ["players"] });
    await qc.invalidateQueries({ queryKey: ["conversations"] });
    setOpen(false);
  }

  const secondaryPositionsText = (form.watch("secondaryPositions") ?? []).join(", ");

  return (
    <>
      <Button
        type="button"
        className="h-11 w-full gap-2 rounded-xl border border-white/15 bg-[var(--bg-surface)] text-foreground hover:bg-white/[0.08]"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        Edit profile
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex max-h-[min(92dvh,800px)] flex-col gap-0 rounded-t-3xl border-white/[0.08] bg-[var(--bg-deep)] p-0"
        >
          <div className="flex shrink-0 justify-center pt-2">
            <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
          </div>

          <SheetHeader className="shrink-0 border-b border-white/[0.06] px-4 pb-4 pt-2 text-left">
            <SheetTitle className="text-lg font-semibold">Edit profile</SheetTitle>
            <SheetDescription>
              Coaches see this on Discover and Search.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-y-contain px-4 py-4">
              <ProfileFormSection title="Basics">
                <ProfileFormField
                  label="Full name"
                  error={form.formState.errors.fullName?.message}
                >
                  <Input {...form.register("fullName")} className={profileFieldClass} />
                </ProfileFormField>
                <div className="grid grid-cols-2 gap-3">
                  <ProfileFormField label="Age">
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...form.register("age", { valueAsNumber: true })}
                      className={profileFieldClass}
                    />
                  </ProfileFormField>
                  <ProfileFormField label="Height (cm)">
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...form.register("heightCm", { valueAsNumber: true })}
                      className={profileFieldClass}
                    />
                  </ProfileFormField>
                </div>
                <ProfileFormField label="Location">
                  <Input {...form.register("location")} className={profileFieldClass} />
                </ProfileFormField>
              </ProfileFormSection>

              <ProfileFormSection title="Football">
                <ProfileFormField label="Primary position">
                  <Input
                    {...form.register("position")}
                    placeholder="e.g. Goalkeeper"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <ProfileFormField
                  label="Other positions"
                  hint="Separate with commas"
                >
                  <Input
                    value={secondaryPositionsText}
                    onChange={(e) =>
                      form.setValue(
                        "secondaryPositions",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="e.g. Centre back, CDM"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ProfileFormSelect
                    label="Dominant foot"
                    value={form.watch("dominantFoot")}
                    onValueChange={(v) =>
                      form.setValue("dominantFoot", v as PlayerOnboardingInput["dominantFoot"])
                    }
                    options={FOOT_OPTIONS}
                  />
                  <ProfileFormSelect
                    label="Experience"
                    value={form.watch("experienceLevel")}
                    onValueChange={(v) =>
                      form.setValue(
                        "experienceLevel",
                        v as PlayerOnboardingInput["experienceLevel"]
                      )
                    }
                    options={EXPERIENCE_OPTIONS}
                  />
                </div>
                <ProfileFormField label="Current club">
                  <Input {...form.register("currentClub")} className={profileFieldClass} />
                </ProfileFormField>
              </ProfileFormSection>

              <ProfileFormSection title="About & availability">
                <ProfileFormField label="Bio">
                  <Textarea
                    {...form.register("bio")}
                    rows={4}
                    placeholder="Tell coaches about your style, achievements, and what you're looking for…"
                    className={profileTextareaClass}
                  />
                </ProfileFormField>
                <ProfileFormSelect
                  label="Availability"
                  value={form.watch("availability")}
                  onValueChange={(v) =>
                    form.setValue("availability", v as PlayerOnboardingInput["availability"])
                  }
                  options={AVAILABILITY_OPTIONS}
                />
                <ProfileFormYesNo
                  label="Willing to travel"
                  value={form.watch("willingToTravel")}
                  onChange={(v) => form.setValue("willingToTravel", v)}
                />
              </ProfileFormSection>
            </div>

            <SheetFooter className="shrink-0 gap-2 border-t border-white/[0.06] bg-[var(--bg-deep)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <PremiumButton type="submit" className="h-11 w-full" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </PremiumButton>
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full text-muted-foreground hover:text-foreground"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
