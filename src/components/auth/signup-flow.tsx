"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { abandonIncompleteSetup } from "@/features/auth/actions";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";
import { isIncompleteSetup } from "@/lib/auth/setup-state";
import { SignupForm } from "@/components/auth/signup-form";
import { SetupExitDialog } from "@/components/auth/setup-exit-dialog";
import { PremiumButton } from "@/components/ui/premium-button";

type GateState = "loading" | "form" | "resume" | "fresh-prompt";

export function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fresh = searchParams.get("fresh") === "1";

  const [gate, setGate] = useState<GateState>("loading");
  const [continueHref, setContinueHref] = useState("/role");
  const [abandoning, setAbandoning] = useState(false);
  const [abandonNotice, setAbandonNotice] = useState<string | null>(null);

  const startFresh = useCallback(async () => {
    setAbandoning(true);
    setAbandonNotice(null);
    try {
      const result = await abandonIncompleteSetup();
      if (result?.error) setAbandonNotice(result.error);
      setGate("form");
      router.replace("/signup");
      router.refresh();
    } finally {
      setAbandoning(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setGate("form");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_complete")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (!isIncompleteSetup(profile)) {
        router.replace(getPostLoginRedirect(profile));
        return;
      }

      setContinueHref(getPostLoginRedirect(profile));

      if (fresh) {
        setGate("fresh-prompt");
        return;
      }

      setGate("resume");
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fresh, router]);

  if (gate === "loading") {
    return <p className="mt-6 text-sm text-muted-foreground">Loading…</p>;
  }

  if (gate === "fresh-prompt") {
    return (
      <SetupExitDialog
        open
        onOpenChange={(open) => {
          if (!open && !abandoning) router.push(continueHref);
        }}
        title="Start a new account?"
        description="You already started signing up on this device. Continue where you left off, or start over with a new email and password (this removes the unfinished account)."
        confirmLabel="Start over"
        cancelLabel="Continue setup"
        confirming={abandoning}
        onConfirm={startFresh}
        onCancel={() => router.push(continueHref)}
      />
    );
  }

  if (gate === "form") {
    return (
      <>
        {abandonNotice ? (
          <p className="mb-4 text-sm text-amber-400/90">{abandonNotice}</p>
        ) : null}
        <SignupForm />
      </>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        You have an unfinished account on this device. Continue where you left off, or start over
        with a new email and password.
      </p>
      <Link href={continueHref} className="block">
        <PremiumButton type="button" className="w-full">
          Continue setup
        </PremiumButton>
      </Link>
      <PremiumButton
        type="button"
        variant="outline"
        className="w-full border-white/20"
        loading={abandoning}
        onClick={() => void startFresh()}
      >
        Start over
      </PremiumButton>
    </div>
  );
}
