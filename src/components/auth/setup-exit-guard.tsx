"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { abandonIncompleteSetup } from "@/features/auth/actions";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";
import { isIncompleteSetup, isSetupFlowPath } from "@/lib/auth/setup-state";
import { SetupExitDialog } from "@/components/auth/setup-exit-dialog";

export function SetupExitGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [incomplete, setIncomplete] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState("/");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setIncomplete(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_complete")
        .eq("id", user.id)
        .single();

      if (!cancelled) setIncomplete(isIncompleteSetup(profile));
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!incomplete) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [incomplete]);

  const requestLeave = useCallback((href: string) => {
    setPendingHref(href);
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (!incomplete) return;

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const path = href.startsWith("http")
        ? new URL(href, window.location.origin).pathname
        : href.split("?")[0];

      if (isSetupFlowPath(path)) return;

      event.preventDefault();
      event.stopPropagation();
      requestLeave(href.startsWith("/") ? href : `/${href}`);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [incomplete, requestLeave]);

  async function confirmLeave() {
    setConfirming(true);
    try {
      await abandonIncompleteSetup();
      setDialogOpen(false);
      setIncomplete(false);
      router.push(pendingHref);
      router.refresh();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <>
      {children}
      <SetupExitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Leave account setup?"
        description="Your progress is not finished. Leaving will cancel this signup and remove the account you started. You can create a new account anytime from the homepage."
        confirmLabel="Leave and cancel"
        confirming={confirming}
        onConfirm={confirmLeave}
      />
    </>
  );
}
