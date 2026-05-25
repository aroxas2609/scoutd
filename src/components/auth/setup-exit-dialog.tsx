"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";

type SetupExitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirming?: boolean;
  /** Secondary action label. Default: "Stay" (dismiss without confirming). */
  cancelLabel?: string;
  onCancel?: () => void;
};

export function SetupExitDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirming = false,
  cancelLabel = "Stay",
  onCancel,
}: SetupExitDialogProps) {
  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!confirming}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t-0 bg-transparent p-0 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={confirming}
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <PremiumButton type="button" loading={confirming} onClick={() => void onConfirm()}>
            {confirmLabel}
          </PremiumButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
