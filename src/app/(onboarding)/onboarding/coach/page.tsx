"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { coachOnboardingSchema, type CoachOnboardingInput } from "@/features/onboarding/schemas";
import { completeCoachOnboarding } from "@/features/onboarding/actions";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function CoachOnboardingPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CoachOnboardingInput>({
    resolver: zodResolver(coachOnboardingSchema),
    defaultValues: { ageGroups: [] },
  });

  async function onSubmit(data: CoachOnboardingInput) {
    const result = await completeCoachOnboarding(data);
    if (result?.error) setError(result.error);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--accent-neon)]">Coach onboarding</p>
      <h1 className="font-display mt-2 text-2xl font-bold">Club profile</h1>
      <Progress value={step === 0 ? 50 : 100} className="mt-4 h-1" />
      <GlassCard className="mt-8 p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label>Your name</Label>
                <Input
                  {...form.register("coachName")}
                  placeholder="e.g. James Smith"
                  className="mt-1 bg-white/5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Shown to players in Messages — use your real name.
                </p>
                {form.formState.errors.coachName && (
                  <p className="mt-1 text-xs text-red-400">{form.formState.errors.coachName.message}</p>
                )}
              </div>
              <div>
                <Label>Club name</Label>
                <Input {...form.register("clubName")} className="mt-1 bg-white/5" />
              </div>
              <div>
                <Label>League / division</Label>
                <Input {...form.register("league")} className="mt-1 bg-white/5" />
              </div>
              <div>
                <Label>Suburb / area</Label>
                <Input {...form.register("location")} className="mt-1 bg-white/5" />
              </div>
              <div>
                <Label>Street address (optional)</Label>
                <Input {...form.register("address")} className="mt-1 bg-white/5" />
              </div>
              <div>
                <Label>Club email (optional)</Label>
                <Input
                  type="email"
                  {...form.register("contactEmail")}
                  className="mt-1 bg-white/5"
                />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input type="tel" {...form.register("contactPhone")} className="mt-1 bg-white/5" />
              </div>
              <div>
                <Label>Age groups (comma separated)</Label>
                <Input
                  className="mt-1 bg-white/5"
                  onChange={(e) =>
                    form.setValue("ageGroups", e.target.value.split(",").map((s) => s.trim()))
                  }
                />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <Label>Recruiting needs</Label>
                <Textarea {...form.register("recruitingNeeds")} className="mt-1 bg-white/5" rows={4} />
              </div>
              <div>
                <Label>About</Label>
                <Textarea {...form.register("about")} className="mt-1 bg-white/5" rows={3} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </>
          )}
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <PremiumButton
                type="button"
                variant="outline"
                className="flex-1 border-white/20"
                onClick={() => setStep(0)}
              >
                Back
              </PremiumButton>
            )}
            {step === 0 ? (
              <PremiumButton type="button" className="flex-1" onClick={() => setStep(1)}>
                Continue
              </PremiumButton>
            ) : (
              <PremiumButton type="submit" className="flex-1">Launch club profile</PremiumButton>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
