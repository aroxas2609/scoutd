"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useViewerRole } from "@/features/auth/use-viewer-role";
import { PageLoader } from "@/components/ui/page-loader";
import { PremiumButton } from "@/components/ui/premium-button";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { data: viewer, isLoading, isError } = useViewerRole();

  useEffect(() => {
    if (!viewer?.userId || !viewer.role) return;

    if (viewer.role === "coach") {
      router.replace(`/profile/coach/${viewer.userId}`);
      return;
    }
    if (viewer.role === "player") {
      router.replace(`/profile/player/${viewer.userId}`);
    }
  }, [viewer, router]);

  if (isError) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load your account. Try refreshing the page.
        </p>
      </div>
    );
  }

  if (!isLoading && viewer?.userId && !viewer.role) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">Choose your account type to continue.</p>
        <Link href="/role" className="mt-4 inline-block">
          <PremiumButton>Select role</PremiumButton>
        </Link>
      </div>
    );
  }

  return <PageLoader />;
}
