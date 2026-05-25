"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  coachOnboardingSchema,
  type CoachOnboardingInput,
} from "@/features/onboarding/schemas";
import { COACH_ONBOARDING_STEP_FIELDS } from "@/features/onboarding/step-fields";
import { goBackToRoleSelection } from "@/features/auth/role-actions";
import { completeCoachOnboarding } from "@/features/onboarding/actions";
import { AgeGroupsSelect } from "@/components/forms/age-groups-select";
import { AustraliaLocationField } from "@/components/forms/australia-location-field";
import { AssociationSelect } from "@/components/forms/association-select";
import { DistrictSuggestionBanner } from "@/components/forms/district-suggestion-banner";
import { OnboardingField } from "@/components/onboarding/onboarding-field";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function CoachOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepBusy, setStepBusy] = useState(false);

  const form = useForm<CoachOnboardingInput>({
    resolver: zodResolver(coachOnboardingSchema),
    defaultValues: { ageGroups: [] },
    mode: "onTouched",
  });

  const { errors } = form.formState;

  async function goToStep1() {
    setError(null);
    setStepBusy(true);
    try {
      const ok = await form.trigger(COACH_ONBOARDING_STEP_FIELDS[0]);
      if (!ok) return;
      setStep(1);
    } finally {
      setStepBusy(false);
    }
  }

  async function onSubmit(data: CoachOnboardingInput) {
    setError(null);
    setSubmitting(true);
    try {
      const result = await completeCoachOnboarding(data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Could not save your club profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--accent-neon)]">
        Coach onboarding
      </p>
      <h1 className="font-display mt-2 text-2xl font-bold">Club profile</h1>
      <Progress value={step === 0 ? 50 : 100} className="mt-4 h-1" />
      <GlassCard className="mt-8 p-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
        >
          {step === 0 && (
            <>
              <OnboardingField
                label="Your name"
                hint="Shown to players in Messages — use your real name."
                error={errors.coachName?.message}
              >
                <Input
                  {...form.register("coachName")}
                  placeholder="e.g. James Smith"
                  autoComplete="name"
                  className={cn("mt-0 bg-white/5", errors.coachName && "border-red-400/50")}
                />
              </OnboardingField>
              <OnboardingField label="Club name" error={errors.clubName?.message}>
                <Input
                  {...form.register("clubName")}
                  className={cn("mt-0 bg-white/5", errors.clubName && "border-red-400/50")}
                />
              </OnboardingField>
              <OnboardingField
                label="Suburb"
                error={
                  errors.locationSuburb?.message ??
                  errors.postcode?.message ??
                  errors.locationState?.message
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
                  error={
                    !!(
                      errors.locationSuburb ||
                      errors.postcode ||
                      errors.locationState
                    )
                  }
                />
              </OnboardingField>
              <DistrictSuggestionBanner
                postcode={form.watch("postcode") ?? ""}
                currentDistrictValue={form.watch("league") ?? ""}
                onAccept={({ associationName }) =>
                  form.setValue("league", associationName, { shouldValidate: true })
                }
              />
              <OnboardingField
                label="Association"
                hint="Optional — Metro NSW"
                error={errors.league?.message}
              >
                <AssociationSelect
                  value={form.watch("league") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("league", v || undefined, { shouldValidate: true })
                  }
                  error={!!errors.league}
                />
              </OnboardingField>
              <OnboardingField label="Street address" hint="Optional" error={errors.address?.message}>
                <Input {...form.register("address")} className="mt-0 bg-white/5" />
              </OnboardingField>
              <OnboardingField label="Club email" hint="Optional" error={errors.contactEmail?.message}>
                <Input
                  type="email"
                  {...form.register("contactEmail")}
                  className={cn("mt-0 bg-white/5", errors.contactEmail && "border-red-400/50")}
                />
              </OnboardingField>
              <OnboardingField label="Phone" hint="Optional" error={errors.contactPhone?.message}>
                <Input type="tel" {...form.register("contactPhone")} className="mt-0 bg-white/5" />
              </OnboardingField>
              <OnboardingField label="Age groups" error={errors.ageGroups?.message}>
                <AgeGroupsSelect
                  value={form.watch("ageGroups") ?? []}
                  onChange={(codes) =>
                    form.setValue("ageGroups", codes as CoachOnboardingInput["ageGroups"], {
                      shouldValidate: true,
                    })
                  }
                  error={!!errors.ageGroups}
                />
              </OnboardingField>
            </>
          )}
          {step === 1 && (
            <>
              <OnboardingField
                label="Recruiting needs"
                error={errors.recruitingNeeds?.message}
              >
                <Textarea
                  {...form.register("recruitingNeeds")}
                  className={cn("mt-0 bg-white/5", errors.recruitingNeeds && "border-red-400/50")}
                  rows={4}
                  placeholder="Positions, age range, playing style…"
                />
              </OnboardingField>
              <OnboardingField label="About" hint="Optional" error={errors.about?.message}>
                <Textarea {...form.register("about")} className="mt-0 bg-white/5" rows={3} />
              </OnboardingField>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </>
          )}
          <div className="flex gap-3 pt-4">
            {step > 0 ? (
              <PremiumButton
                type="button"
                variant="outline"
                className="flex-1 border-white/20"
                disabled={submitting || stepBusy}
                onClick={() => {
                  setError(null);
                  setStep(0);
                }}
              >
                Back
              </PremiumButton>
            ) : (
              <PremiumButton
                type="button"
                variant="outline"
                className="flex-1 border-white/20"
                disabled={submitting || stepBusy}
                loading={stepBusy}
                onClick={() => {
                  setError(null);
                  setStepBusy(true);
                  void goBackToRoleSelection().finally(() => setStepBusy(false));
                }}
              >
                Change role
              </PremiumButton>
            )}
            {step === 0 ? (
              <PremiumButton
                type="button"
                className="flex-1"
                loading={stepBusy}
                disabled={stepBusy}
                onClick={() => void goToStep1()}
              >
                {stepBusy ? "Checking…" : "Continue"}
              </PremiumButton>
            ) : (
              <PremiumButton
                type="button"
                className="flex-1"
                loading={submitting}
                disabled={submitting || stepBusy}
                onClick={() => void form.handleSubmit(onSubmit)()}
              >
                {submitting ? "Launching…" : "Launch club profile"}
              </PremiumButton>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
