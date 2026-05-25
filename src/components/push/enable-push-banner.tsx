"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { savePushSubscription, removePushSubscription } from "@/features/push/actions";
import {
  getPushSubscriptionPayload,
  unsubscribePushOnDevice,
} from "@/features/push/subscribe";
import { getVapidPublicKey, isWebPushSupported } from "@/features/push/support";
import { usePushSubscriptionsEnabled } from "@/features/push/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EnablePushBannerProps = {
  className?: string;
  variant?: "banner" | "row";
};

export function EnablePushBanner({ className, variant = "banner" }: EnablePushBannerProps) {
  const qc = useQueryClient();
  const { data: subscriptionCount = 0, refetch } = usePushSubscriptionsEnabled();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!isWebPushSupported()) {
      setSupported(false);
      return;
    }
    setSupported(true);
    setPermission(Notification.permission);
  }, []);

  if (!supported || !getVapidPublicKey()) return null;

  const enabled = subscriptionCount > 0 && permission === "granted";
  const denied = permission === "denied";

  async function enable() {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        toast.error("Notifications blocked", {
          description: "Enable notifications in your browser or device settings.",
        });
        return;
      }
      const payload = await getPushSubscriptionPayload();
      if (!payload) {
        toast.error("Could not register for push", {
          description: "Use a production build (npm run build && npm run start) or the live site.",
        });
        return;
      }
      const saved = await savePushSubscription(payload);
      if (saved.error) {
        toast.error(saved.error);
        return;
      }
      await refetch();
      qc.invalidateQueries({ queryKey: ["push-subscriptions"] });
      toast.success("Notifications enabled");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const payload = await getPushSubscriptionPayload();
      if (payload?.endpoint) {
        await removePushSubscription(payload.endpoint);
      }
      await unsubscribePushOnDevice();
      await refetch();
      qc.invalidateQueries({ queryKey: ["push-subscriptions"] });
      toast.success("Notifications turned off");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "row") {
    return (
      <div className={cn("flex items-center justify-between gap-3 px-4 py-3", className)}>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Message notifications</p>
          <p className="text-xs text-muted-foreground">
            {denied
              ? "Blocked in browser settings"
              : enabled
                ? "Alerts when you receive a new message"
                : "Get alerts on this device"}
          </p>
        </div>
        {enabled ? (
          <PremiumButton type="button" variant="outline" size="sm" disabled={busy} onClick={disable}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn off"}
          </PremiumButton>
        ) : (
          <PremiumButton type="button" size="sm" disabled={busy || denied} onClick={enable}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable"}
          </PremiumButton>
        )}
      </div>
    );
  }

  if (enabled || denied) return null;

  return (
    <div
      className={cn(
        "mx-4 mb-3 flex items-start gap-3 rounded-2xl border border-[var(--accent-brand)]/25 bg-[var(--accent-brand)]/8 px-4 py-3 lg:mx-0",
        className
      )}
    >
      <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-brand)]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Turn on message alerts</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Get notified on this device when someone messages you. On iPhone, add Scoutd to your Home
          Screen first.
        </p>
        <PremiumButton
          type="button"
          size="sm"
          className="mt-2"
          disabled={busy}
          onClick={enable}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enabling…
            </>
          ) : (
            "Enable notifications"
          )}
        </PremiumButton>
      </div>
    </div>
  );
}

export function PushNotificationSettingsRow({ className }: { className?: string }) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isWebPushSupported() && !!getVapidPublicKey());
  }, []);

  if (!supported) return null;

  return (
    <div className={cn("border-t border-white/[0.06]", className)}>
      <EnablePushBanner variant="row" />
    </div>
  );
}
