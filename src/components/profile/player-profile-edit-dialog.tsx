"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import {
  ProfileSettingsDivider,
  ProfileSettingsRow,
} from "@/components/profile/profile-settings";
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
import { AustraliaLocationField } from "@/components/forms/australia-location-field";
import { PositionSelect } from "@/components/forms/position-select";
import { isFootballPosition } from "@/lib/football/positions";
import {
  DateOfBirthField,
  formatAgeHint,
} from "@/components/forms/date-of-birth-field";
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
import {
  AVAILABILITY_OPTIONS,
  DOMINANT_FOOT_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/lib/form-options";

interface PlayerProfileEditDialogProps {
  player: PlayerProfile;
  embedded?: boolean;
}

export function PlayerProfileEditDialog({ player, embedded }: PlayerProfileEditDialogProps) {
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
      {embedded ? (
        <ProfileSettingsRow
          icon={Pencil}
          label="Edit profile"
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button
          type="button"
          className="h-11 w-full gap-2 rounded-xl border border-white/15 bg-[var(--bg-surface)] text-foreground hover:bg-white/[0.08]"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit profile
        </Button>
      )}

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
                <ProfileFormField
                  label="Date of birth"
                  labelExtra={
                    formatAgeHint(form.watch("dateOfBirth") ?? "") ? (
                      <span className="text-sm font-medium text-[var(--accent-electric)]">
                        {formatAgeHint(form.watch("dateOfBirth") ?? "")}
                      </span>
                    ) : null
                  }
                  error={form.formState.errors.dateOfBirth?.message}
                >
                  <DateOfBirthField
                    value={form.watch("dateOfBirth") ?? ""}
                    onChange={(v) =>
                      form.setValue("dateOfBirth", v, { shouldValidate: true })
                    }
                    error={!!form.formState.errors.dateOfBirth}
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <div className="grid grid-cols-2 gap-3">
                  <ProfileFormField label="Height (cm)">
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...form.register("heightCm", {
                        setValueAs: (v) =>
                          v === "" || v == null ? undefined : Number(v),
                      })}
                      className={profileFieldClass}
                    />
                  </ProfileFormField>
                </div>
                <ProfileFormField
                  label="Location"
                  error={
                    form.formState.errors.locationSuburb?.message ??
                    form.formState.errors.postcode?.message
                  }
                >
                  <AustraliaLocationField
                    suburb={form.watch("locationSuburb") ?? ""}
                    state={form.watch("locationState") ?? ""}
                    postcode={form.watch("postcode") ?? ""}
                    onSelect={(option) => {
                      form.setValue("locationSuburb", option.suburb, {
                        shouldValidate: true,
                      });
                      form.setValue("locationState", option.state, {
                        shouldValidate: true,
                      });
                      form.setValue("postcode", option.postcode, {
                        shouldValidate: true,
                      });
                    }}
                    onClear={() => {
                      form.setValue("locationSuburb", "");
                      form.setValue("locationState", "");
                      form.setValue("postcode", "");
                    }}
                    className={profileFieldClass}
                  />
                </ProfileFormField>
              </ProfileFormSection>

              <ProfileFormSection title="Football">
                <ProfileFormField
                  label="Primary position"
                  error={form.formState.errors.position?.message}
                >
                  <PositionSelect
                    value={
                      isFootballPosition(form.watch("position") ?? "")
                        ? form.watch("position")!
                        : ""
                    }
                    onValueChange={(v) =>
                      form.setValue("position", v as PlayerOnboardingInput["position"], {
                        shouldValidate: true,
                      })
                    }
                    className={profileFieldClass}
                    error={!!form.formState.errors.position}
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
                    options={[...DOMINANT_FOOT_OPTIONS]}
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
                    options={[...EXPERIENCE_LEVEL_OPTIONS]}
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
                  options={[...AVAILABILITY_OPTIONS]}
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
