"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTrialInvite } from "@/features/trials/actions";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { profileActionClass } from "@/components/profile/player-profile-action-styles";
import { cn } from "@/lib/utils";

type TrialInviteDialogProps = {
  playerId: string;
  layout?: "default" | "profile";
};

export function TrialInviteDialog({
  playerId,
  layout = "default",
}: TrialInviteDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    formData.set("playerId", playerId);
    const result = await createTrialInvite(formData);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Trial invite sent");
      setOpen(false);
    }
  }

  const isProfile = layout === "profile";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          isProfile
            ? profileActionClass("primary")
            : "flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-white/90 active:scale-[0.99]"
        )}
      >
        <Calendar className={cn(isProfile ? "h-[18px] w-[18px]" : "h-4 w-4")} />
        Trial
      </button>
      <DialogContent className="border-white/10 bg-[var(--bg-graphite)]">
        <DialogHeader>
          <DialogTitle>Invite to trial</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label>Date & time</Label>
            <Input name="scheduledAt" type="datetime-local" required className="mt-1 bg-white/5" />
          </div>
          <div>
            <Label>Location</Label>
            <Input name="location" required className="mt-1 bg-white/5" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea name="notes" className="mt-1 bg-white/5" />
          </div>
          <PremiumButton type="submit" className="w-full">Send invite</PremiumButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
