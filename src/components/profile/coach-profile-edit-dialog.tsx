"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  coachOnboardingSchema,
  type CoachOnboardingInput,
} from "@/features/onboarding/schemas";
import { updateCoachProfile } from "@/features/profile/actions";
import { coachProfileToForm } from "@/features/profile/mappers";
import type { CoachProfile } from "@/types/database";
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
  profileFieldClass,
  profileTextareaClass,
} from "@/components/profile/profile-form-primitives";

interface CoachProfileEditDialogProps {
  coach: CoachProfile;
}

export function CoachProfileEditDialog({ coach }: CoachProfileEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const form = useForm<CoachOnboardingInput>({
    resolver: zodResolver(coachOnboardingSchema),
    defaultValues: coachProfileToForm(coach),
  });

  useEffect(() => {
    if (open) {
      form.reset(coachProfileToForm(coach));
    }
  }, [open, coach, form]);

  async function onSubmit(data: CoachOnboardingInput) {
    setSaving(true);
    const result = await updateCoachProfile(data);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated");
    await qc.invalidateQueries({ queryKey: ["coach", coach.user_id] });
    await qc.invalidateQueries({ queryKey: ["conversations"] });
    setOpen(false);
  }

  const ageGroupsText = (form.watch("ageGroups") ?? []).join(", ");

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
            <SheetTitle className="text-lg font-semibold">Edit club profile</SheetTitle>
            <SheetDescription>Players see this when they browse clubs.</SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-y-contain px-4 py-4">
              <ProfileFormSection title="Club details">
                <ProfileFormField
                  label="Your name"
                  hint="How players see you in Messages"
                  error={form.formState.errors.coachName?.message}
                >
                  <Input
                    {...form.register("coachName")}
                    placeholder="e.g. James Smith"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <ProfileFormField
                  label="Club name"
                  error={form.formState.errors.clubName?.message}
                >
                  <Input {...form.register("clubName")} className={profileFieldClass} />
                </ProfileFormField>
                <ProfileFormField label="League / division">
                  <Input {...form.register("league")} className={profileFieldClass} />
                </ProfileFormField>
                <ProfileFormField label="Suburb / area">
                  <Input
                    {...form.register("location")}
                    placeholder="e.g. Moorebank"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <ProfileFormField label="Age groups" hint="Separate with commas">
                  <Input
                    value={ageGroupsText}
                    onChange={(e) =>
                      form.setValue(
                        "ageGroups",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="e.g. U16, U18"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
              </ProfileFormSection>

              <ProfileFormSection title="Contact">
                <ProfileFormField label="Street address">
                  <Input
                    {...form.register("address")}
                    placeholder="e.g. 12 Park Rd, Moorebank NSW"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <ProfileFormField
                  label="Club email"
                  error={form.formState.errors.contactEmail?.message}
                >
                  <Input
                    type="email"
                    inputMode="email"
                    {...form.register("contactEmail")}
                    placeholder="contact@yourclub.com"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <ProfileFormField label="Phone">
                  <Input
                    type="tel"
                    inputMode="tel"
                    {...form.register("contactPhone")}
                    placeholder="e.g. 0412 345 678"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
                <ProfileFormField label="Second phone (optional)">
                  <Input
                    type="tel"
                    inputMode="tel"
                    {...form.register("contactPhoneAlt")}
                    placeholder="e.g. club office line"
                    className={profileFieldClass}
                  />
                </ProfileFormField>
              </ProfileFormSection>

              <ProfileFormSection title="Recruiting">
                <ProfileFormField
                  label="Recruiting needs"
                  error={form.formState.errors.recruitingNeeds?.message}
                >
                  <Textarea
                    {...form.register("recruitingNeeds")}
                    rows={4}
                    className={profileTextareaClass}
                  />
                </ProfileFormField>
                <ProfileFormField label="About the club">
                  <Textarea
                    {...form.register("about")}
                    rows={3}
                    className={profileTextareaClass}
                  />
                </ProfileFormField>
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
