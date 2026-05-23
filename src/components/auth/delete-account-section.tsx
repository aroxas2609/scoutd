"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/features/auth/actions";
import {
  ProfileSettingsCard,
  ProfileSettingsRow,
} from "@/components/profile/profile-settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONFIRM_TEXT = "DELETE";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  function resetDialog() {
    setConfirm("");
    setOpen(false);
  }

  function handleDelete() {
    if (confirm !== CONFIRM_TEXT) {
      toast.error(`Type ${CONFIRM_TEXT} to confirm`);
      return;
    }

    startTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Your account has been deleted");
      resetDialog();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <>
      <ProfileSettingsCard>
        <ProfileSettingsRow
          icon={Trash2}
          label="Delete account"
          onClick={() => setOpen(true)}
          chevron="none"
          destructive
        />
      </ProfileSettingsCard>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) {
            setOpen(next);
            if (!next) setConfirm("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This permanently removes your profile, messages, trials, and saved
              data. You can register again with the same email. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-medium text-foreground">{CONFIRM_TEXT}</span>{" "}
              to confirm
            </p>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={CONFIRM_TEXT}
              autoComplete="off"
              disabled={pending}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={resetDialog}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || confirm !== CONFIRM_TEXT}
              onClick={handleDelete}
            >
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
