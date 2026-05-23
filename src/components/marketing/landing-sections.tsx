"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import {
  Search,
  MessageCircle,
  Calendar,
  Shield,
  Zap,
  Users,
  Quote,
} from "lucide-react";

const features = [
  { icon: Search, title: "Instant Discovery", desc: "Swipe, search, and filter elite talent in seconds." },
  { icon: MessageCircle, title: "Secure Messaging", desc: "Connect directly with verified coaches and players." },
  { icon: Calendar, title: "Trial Invites", desc: "Schedule trials with one tap — accept, decline, or defer." },
  { icon: Shield, title: "Verified Profiles", desc: "Trust badges and moderation for a safe ecosystem." },
];

export function HowItWorks() {
  const steps = [
    { n: "01", title: "Create your profile", desc: "Players showcase highlights. Coaches define recruiting needs." },
    { n: "02", title: "Discover talent", desc: "Search, swipe, and shortlist the perfect fit for your squad." },
    { n: "03", title: "Invite to trial", desc: "Message securely and send trial invites with date, time, and location." },
  ];
  return (
    <section className="border-y border-white/5 bg-[var(--bg-graphite)]/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-center text-3xl font-bold sm:text-4xl">How Scoutd works</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-8">
                <span className="font-display text-4xl font-bold text-[var(--accent-electric)]/40">{s.n}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-bold">Built for the modern game</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlassCard key={f.title} glow className="p-6">
              <f.icon className="h-8 w-8 text-[var(--accent-electric)]" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const items = [
    { quote: "Scoutd changed how we recruit youth talent.", author: "James R.", role: "Academy Director" },
    { quote: "Within a week I had three trial offers from pro clubs.", author: "Sofia M.", role: "Winger, U21" },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6 grid gap-6 md:grid-cols-2">
        {items.map((t) => (
          <GlassCard key={t.author} className="p-8">
            <Quote className="h-8 w-8 text-[var(--accent-electric)]/50" />
            <p className="mt-4 text-lg">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-4 font-medium">{t.author}</p>
            <p className="text-sm text-muted-foreground">{t.role}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
        {[
          { v: "98%", l: "Coach satisfaction" },
          { v: "4.9", l: "App rating" },
          { v: "50+", l: "Countries" },
          { v: "24h", l: "Avg. response" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <p className="font-display text-3xl font-bold text-gradient-electric">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CoachShowcase() {
  return (
    <section className="py-24 bg-[var(--bg-graphite)]/30">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h2 className="font-display text-3xl font-bold">For coaches & clubs</h2>
          <p className="mt-4 text-muted-foreground">
            Build your club profile, define recruiting needs, and discover players through
            premium search and swipe discovery.
          </p>
          <ul className="mt-6 space-y-3">
            {["Advanced filters", "Shortlist collections", "Trial management"].map((i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-[var(--accent-electric)]" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <GlassCard className="flex-1 p-8">
          <Users className="h-12 w-12 text-[var(--accent-neon)]" />
          <h3 className="mt-4 font-display text-xl font-bold">Elite FC Academy</h3>
          <p className="text-sm text-muted-foreground">Premier League · U16-U21</p>
          <p className="mt-4 text-sm">Seeking: Pacey wingers, ball-playing CBs</p>
        </GlassCard>
      </div>
    </section>
  );
}

export function MobileMockup() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="font-display text-3xl font-bold">Install Scoutd</h2>
        <p className="mt-2 text-muted-foreground">Premium PWA — feels native on iPhone</p>
        <div className="mt-12 mx-auto h-[480px] w-[240px] rounded-[2.5rem] border-4 border-white/20 bg-[var(--bg-elevated)] shadow-[0_0_60px_rgba(57,255,20,0.15)] p-2">
          <div className="h-full w-full rounded-[2rem] bg-[var(--bg-deep)] overflow-hidden">
            <div className="h-8 bg-white/5" />
            <div className="p-4 space-y-3">
              <div className="h-24 rounded-xl bg-gradient-to-br from-[var(--accent-electric)]/20 to-transparent" />
              <div className="h-3 w-2/3 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-24">
      <GlassCard glow className="mx-auto max-w-4xl p-12 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to get discovered?</h2>
        <p className="mt-4 text-muted-foreground">Join thousands of players and coaches on Scoutd.</p>
        <Link href="/signup" className="mt-8 inline-block">
          <PremiumButton size="lg">Start free</PremiumButton>
        </Link>
      </GlassCard>
    </section>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <p className="font-display text-lg font-bold">Scoutd</p>
        <p className="text-sm text-muted-foreground">Find Your Next Player. © {new Date().getFullYear()}</p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}

export function MarketingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--bg-deep)]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold">
          Scoutd
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-white">
            Sign in
          </Link>
          <Link href="/signup">
            <PremiumButton size="sm">Get Started</PremiumButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
