"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import {
  CoachShowcase,
  CtaSection,
  FeaturesGrid,
  HowItWorks,
  MarketingFooter,
  MarketingHeader,
  MobileMockup,
  StatsSection,
  Testimonials,
} from "@/components/marketing/landing-sections";

function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(94,234,212,0.12),transparent)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 xl:max-w-[90rem]">
        <div>
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--accent-brand)]" />
            Local clubs & community football
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl xl:text-6xl">
            Find players for{" "}
            <span className="text-[var(--accent-brand)]">your club</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Discover players nearby, stay in touch, and arrange trials — built for grassroots
            clubs, not big agencies.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <PremiumButton size="lg" className="h-12 gap-2 px-6 text-base">
                Get started
                <ArrowRight className="h-4 w-4" />
              </PremiumButton>
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            <div className="absolute -inset-4 rounded-[2.75rem] bg-[var(--accent-brand)]/10 blur-2xl" />
            <div className="relative mx-auto h-[520px] w-[260px] rounded-[2.5rem] border-4 border-white/20 bg-[var(--bg-elevated)] p-2 shadow-2xl">
              <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-[var(--bg-deep)]">
                <div className="h-10 shrink-0 bg-white/5" />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="h-28 rounded-xl bg-gradient-to-br from-[var(--accent-brand)]/25 to-transparent" />
                  <div className="h-3 w-4/5 rounded bg-white/10" />
                  <div className="h-3 w-3/5 rounded bg-white/5" />
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <div className="h-16 rounded-lg bg-white/[0.06]" />
                    <div className="h-16 rounded-lg bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingDesktop() {
  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] text-foreground">
      <MarketingHeader />
      <LandingHero />
      <FeaturesGrid />
      <HowItWorks />
      <StatsSection />
      <Testimonials />
      <CoachShowcase />
      <MobileMockup />
      <div className="mx-auto max-w-6xl px-6 xl:max-w-[90rem]">
        <CtaSection />
      </div>
      <MarketingFooter />
    </div>
  );
}
