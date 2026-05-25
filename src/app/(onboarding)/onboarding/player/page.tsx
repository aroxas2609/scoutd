"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  playerOnboardingSchema,
  type PlayerOnboardingInput,
} from "@/features/onboarding/schemas";
import { PLAYER_ONBOARDING_STEP_FIELDS } from "@/features/onboarding/step-fields";
import { goBackToRoleSelection } from "@/features/auth/role-actions";
import { completePlayerOnboarding } from "@/features/onboarding/actions";
import { OnboardingField } from "@/components/onboarding/onboarding-field";
import { AssociationSelect } from "@/components/forms/association-select";
import { DistrictSuggestionBanner } from "@/components/forms/district-suggestion-banner";
import { AustraliaLocationField } from "@/components/forms/australia-location-field";
import { PositionSelect } from "@/components/forms/position-select";
import { SheetSelect } from "@/components/forms/sheet-select";
import {
  DOMINANT_FOOT_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/lib/form-options";
import {
  DateOfBirthField,
  formatAgeHint,
} from "@/components/forms/date-of-birth-field";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProfileFormYesNo } from "@/components/profile/profile-form-primitives";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "Position", "Club", "Bio", "Availability"];

export default function PlayerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepBusy, setStepBusy] = useState(false);

  const form = useForm<PlayerOnboardingInput>({
    resolver: zodResolver(playerOnboardingSchema),
    defaultValues: {
      willingToTravel: false,
      availability: "available",
      secondaryPositions: [],
    },
    mode: "onTouched",
  });

  const { errors } = form.formState;
  const progress = ((step + 1) / STEPS.length) * 100;
  const dateOfBirth = form.watch("dateOfBirth");
  const ageHint = formatAgeHint(dateOfBirth ?? "");

  async function goToNextStep() {
    setError(null);
    setStepBusy(true);
    try {
      const fields = PLAYER_ONBOARDING_STEP_FIELDS[step];
      if (fields?.length) {
        const ok = await form.trigger(fields);
        if (!ok) return;
      }
      setStep((s) => s + 1);
    } finally {
      setStepBusy(false);
    }
  }

  async function onSubmit(data: PlayerOnboardingInput) {
    setError(null);
    setSubmitting(true);
    try {
      const result = await completePlayerOnboarding(data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--accent-electric)]">
        Player onboarding
      </p>
      <h1 className="font-display mt-2 text-2xl font-bold">{STEPS[step]}</h1>
      <Progress value={progress} className="mt-4 h-1" />
      <GlassCard className="mt-8 overflow-hidden p-6">
        <form
          className="min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && step < STEPS.length - 1) {
              e.preventDefault();
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-w-0 space-y-4"
            >
              {step === 0 && (
                <>
                  <OnboardingField label="Full name" error={errors.fullName?.message}>
                    <Input
                      {...form.register("fullName")}
                      className={cn("mt-0 bg-white/5", errors.fullName && "border-red-400/50")}
                      autoComplete="name"
                    />
                  </OnboardingField>
                  <OnboardingField
                    label="Date of birth"
                    labelExtra={
                      ageHint ? (
                        <span className="text-sm font-medium text-[var(--accent-electric)]">
                          {ageHint}
                        </span>
                      ) : null
                    }
                    error={errors.dateOfBirth?.message}
                  >
                    <DateOfBirthField
                      value={dateOfBirth ?? ""}
                      onChange={(v) =>
                        form.setValue("dateOfBirth", v, { shouldValidate: true })
                      }
                      error={!!errors.dateOfBirth}
                    />
                  </OnboardingField>
                  <OnboardingField
                    label="Gender"
                    hint="Optional — helps coaches filter squads"
                  >
                    <SegmentedControl<"any" | "female" | "male">
                      segments={[
                        { value: "any", label: "Prefer not to say" },
                        { value: "female", label: "Female" },
                        { value: "male", label: "Male" },
                      ]}
                      value={form.watch("gender") ?? "any"}
                      onChange={(v) =>
                        form.setValue("gender", v === "any" ? undefined : v, {
                          shouldValidate: true,
                        })
                      }
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
                    currentDistrictValue={form.watch("associationId") ?? ""}
                    onAccept={({ associationId }) =>
                      form.setValue("associationId", associationId, { shouldValidate: true })
                    }
                  />
                  <OnboardingField
                    label="District / association"
                    hint="Optional — helps coaches in your area find you"
                    error={errors.associationId?.message}
                  >
                    <AssociationSelect
                      value={form.watch("associationId") ?? ""}
                      onValueChange={(v) =>
                        form.setValue("associationId", v || undefined, { shouldValidate: true })
                      }
                      valueMode="id"
                      placeholder="Select district"
                      clearLabel="No district"
                    />
                  </OnboardingField>
                </>
              )}
              {step === 1 && (
                <>
                  <OnboardingField label="Primary position" error={errors.position?.message}>
                    <PositionSelect
                      value={form.watch("position") ?? ""}
                      onValueChange={(v) =>
                        form.setValue("position", v as PlayerOnboardingInput["position"], {
                          shouldValidate: true,
                        })
                      }
                      error={!!errors.position}
                    />
                  </OnboardingField>
                  <OnboardingField label="Dominant foot" error={errors.dominantFoot?.message}>
                    <SheetSelect
                      value={form.watch("dominantFoot") ?? ""}
                      onValueChange={(v) =>
                        form.setValue("dominantFoot", v as PlayerOnboardingInput["dominantFoot"], {
                          shouldValidate: true,
                        })
                      }
                      options={[...DOMINANT_FOOT_OPTIONS]}
                      placeholder="Select foot"
                      sheetTitle="Dominant foot"
                      error={!!errors.dominantFoot}
                    />
                  </OnboardingField>
                  <OnboardingField
                    label="Height (cm)"
                    hint="Optional"
                    error={errors.heightCm?.message}
                  >
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...form.register("heightCm", {
                        setValueAs: (v) =>
                          v === "" || v == null ? undefined : Number(v),
                      })}
                      className={cn("mt-0 bg-white/5", errors.heightCm && "border-red-400/50")}
                    />
                  </OnboardingField>
                </>
              )}
              {step === 2 && (
                <>
                  <OnboardingField
                    label="Current club"
                    hint="Optional"
                    error={errors.currentClub?.message}
                  >
                    <Input {...form.register("currentClub")} className="mt-0 bg-white/5" />
                  </OnboardingField>
                  <OnboardingField
                    label="Experience level"
                    error={errors.experienceLevel?.message}
                  >
                    <SheetSelect
                      value={form.watch("experienceLevel") ?? ""}
                      onValueChange={(v) =>
                        form.setValue(
                          "experienceLevel",
                          v as PlayerOnboardingInput["experienceLevel"],
                          { shouldValidate: true }
                        )
                      }
                      options={[...EXPERIENCE_LEVEL_OPTIONS]}
                      placeholder="Select level"
                      sheetTitle="Experience level"
                      error={!!errors.experienceLevel}
                    />
                  </OnboardingField>
                </>
              )}
              {step === 3 && (
                <OnboardingField
                  label="Bio"
                  hint="Optional — tell coaches about your game"
                  error={errors.bio?.message}
                >
                  <Textarea
                    {...form.register("bio")}
                    className={cn("mt-0 bg-white/5", errors.bio && "border-red-400/50")}
                    rows={4}
                  />
                </OnboardingField>
              )}
              {step === 4 && (
                <>
                  <ProfileFormYesNo
                    label="Willing to travel"
                    value={form.watch("willingToTravel")}
                    onChange={(v) => form.setValue("willingToTravel", v)}
                  />
                  <OnboardingField
                    label="Contact email"
                    hint="Optional — coaches can reach you on your profile"
                    error={errors.contactEmail?.message}
                  >
                    <Input
                      type="email"
                      {...form.register("contactEmail")}
                      className={cn("mt-0 bg-white/5", errors.contactEmail && "border-red-400/50")}
                    />
                  </OnboardingField>
                  <OnboardingField
                    label="Phone"
                    hint="Optional"
                    error={errors.contactPhone?.message}
                  >
                    <Input
                      type="tel"
                      {...form.register("contactPhone")}
                      className={cn("mt-0 bg-white/5", errors.contactPhone && "border-red-400/50")}
                    />
                  </OnboardingField>
                  <OnboardingField
                    label="FFA#"
                    hint="Optional — only coaches and clubs can see this"
                    error={errors.ffaNumber?.message}
                  >
                    <Input
                      {...form.register("ffaNumber")}
                      placeholder="e.g. 12345678"
                      className={cn("mt-0 bg-white/5", errors.ffaNumber && "border-red-400/50")}
                    />
                  </OnboardingField>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <PremiumButton
                type="button"
                variant="outline"
                className="flex-1 border-white/20"
                disabled={submitting || stepBusy}
                onClick={() => {
                  setError(null);
                  setStep((s) => s - 1);
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
            {step < STEPS.length - 1 ? (
              <PremiumButton
                type="button"
                className="flex-1"
                loading={stepBusy}
                disabled={stepBusy}
                onClick={() => void goToNextStep()}
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
                {submitting ? "Launching…" : "Launch profile"}
              </PremiumButton>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
