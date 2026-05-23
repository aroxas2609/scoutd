"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { playerOnboardingSchema, type PlayerOnboardingInput } from "@/features/onboarding/schemas";
import { completePlayerOnboarding } from "@/features/onboarding/actions";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ProfileFormYesNo } from "@/components/profile/profile-form-primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = ["Basics", "Position", "Club", "Bio", "Availability"];

export default function PlayerOnboardingPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PlayerOnboardingInput>({
    resolver: zodResolver(playerOnboardingSchema),
    defaultValues: {
      willingToTravel: false,
      availability: "available",
      secondaryPositions: [],
    },
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  async function onSubmit(data: PlayerOnboardingInput) {
    const result = await completePlayerOnboarding(data);
    if (result?.error) setError(result.error);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--accent-electric)]">Player onboarding</p>
      <h1 className="font-display mt-2 text-2xl font-bold">{STEPS[step]}</h1>
      <Progress value={progress} className="mt-4 h-1" />
      <GlassCard className="mt-8 p-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <div>
                    <Label>Full name</Label>
                    <Input {...form.register("fullName")} className="mt-1 bg-white/5" />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" {...form.register("age", { valueAsNumber: true })} className="mt-1 bg-white/5" />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input {...form.register("location")} className="mt-1 bg-white/5" />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <Label>Primary position</Label>
                    <Input {...form.register("position")} placeholder="e.g. ST" className="mt-1 bg-white/5" />
                  </div>
                  <div>
                    <Label>Dominant foot</Label>
                    <Select onValueChange={(v) => form.setValue("dominantFoot", v as "left" | "right" | "both")}>
                      <SelectTrigger className="mt-1 bg-white/5"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <Input type="number" {...form.register("heightCm", { valueAsNumber: true })} className="mt-1 bg-white/5" />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    <Label>Current club</Label>
                    <Input {...form.register("currentClub")} className="mt-1 bg-white/5" />
                  </div>
                  <div>
                    <Label>Experience level</Label>
                    <Select onValueChange={(v) => form.setValue("experienceLevel", v as PlayerOnboardingInput["experienceLevel"])}>
                      <SelectTrigger className="mt-1 bg-white/5"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academy">Academy</SelectItem>
                        <SelectItem value="amateur">Amateur</SelectItem>
                        <SelectItem value="semi_pro">Semi-Pro</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {step === 3 && (
                <div>
                  <Label>Bio</Label>
                  <Textarea {...form.register("bio")} className="mt-1 bg-white/5" rows={4} />
                </div>
              )}
              {step === 4 && (
                <>
                  <ProfileFormYesNo
                    label="Willing to travel"
                    value={form.watch("willingToTravel")}
                    onChange={(v) => form.setValue("willingToTravel", v)}
                  />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <PremiumButton type="button" variant="outline" className="flex-1 border-white/20" onClick={() => setStep((s) => s - 1)}>
                Back
              </PremiumButton>
            )}
            {step < STEPS.length - 1 ? (
              <PremiumButton type="button" className="flex-1" onClick={() => setStep((s) => s + 1)}>
                Continue
              </PremiumButton>
            ) : (
              <PremiumButton type="submit" className="flex-1">Complete profile</PremiumButton>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
