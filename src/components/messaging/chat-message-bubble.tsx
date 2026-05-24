"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Message } from "@/types/database";
import type { useDeleteMessage, useEditMessage } from "@/features/messaging/hooks";
import {
  isMessageEdited,
  isMessageDeleted,
  messageBodyDisplay,
} from "@/features/messaging/message-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { PremiumButton } from "@/components/ui/premium-button";
import { cn } from "@/lib/utils";

type ChatMessageBubbleProps = {
  message: Message;
  isOwn: boolean;
  senderLabel?: string;
  editMessage: ReturnType<typeof useEditMessage>;
  deleteMessage: ReturnType<typeof useDeleteMessage>;
};

export function ChatMessageBubble({
  message,
  isOwn,
  senderLabel,
  editMessage,
  deleteMessage,
}: ChatMessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleted = isMessageDeleted(message);
  const edited = isMessageEdited(message);
  const canModify = isOwn && !deleted && message.type === "text";

  async function handleSaveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error("Message cannot be empty");
      return;
    }
    try {
      await editMessage.mutateAsync({ messageId: message.id, body: trimmed });
      setEditing(false);
      toast.success("Message updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not edit message");
    }
  }

  async function confirmAndDelete() {
    try {
      await deleteMessage.mutateAsync(message.id);
      setConfirmDelete(false);
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete message");
    }
  }

  function startEdit() {
    setDraft(message.body);
    setEditing(true);
    setMenuOpen(false);
    setConfirmDelete(false);
  }

  function startDelete() {
    setMenuOpen(false);
    setConfirmDelete(true);
  }

  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-0.5",
        isOwn ? "ml-auto items-end" : "items-start"
      )}
    >
      {!isOwn && senderLabel && (
        <span className="px-1 text-xs font-medium text-muted-foreground">
          {senderLabel}
        </span>
      )}

      {confirmDelete && (
        <div className="mb-1 w-full max-w-[260px] rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-200">Delete this message?</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={deleteMessage.isPending}
              onClick={() => void confirmAndDelete()}
              className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white"
            >
              {deleteMessage.isPending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={cn("flex items-end gap-1", isOwn && "flex-row-reverse")}>
        {canModify && !editing && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-white active:bg-white/10"
              aria-label="Message options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={8}
              className="z-[100] w-auto min-w-[9.5rem] border border-white/10 bg-[var(--bg-graphite)] text-foreground shadow-xl"
            >
              <DropdownMenuItem
                className="text-white focus:bg-white/10 focus:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  startEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="focus:bg-red-500/15 focus:text-red-300"
                onClick={(e) => {
                  e.preventDefault();
                  startDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {editing ? (
          <div className="w-full min-w-[200px] space-y-2 rounded-2xl bg-white/10 p-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[72px] resize-none bg-white/5 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <PremiumButton
                type="button"
                size="sm"
                className="flex-1"
                disabled={editMessage.isPending}
                onClick={() => void handleSaveEdit()}
              >
                Save
              </PremiumButton>
              <PremiumButton
                type="button"
                size="sm"
                variant="outline"
                className="flex-1 border-white/20"
                onClick={() => {
                  setEditing(false);
                  setDraft(message.body);
                }}
              >
                Cancel
              </PremiumButton>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-2 text-sm",
              isOwn ? "bg-white/[0.12] text-foreground" : "bg-[var(--bg-surface)] border border-white/[0.06]",
              deleted && "italic text-muted-foreground"
            )}
          >
            {messageBodyDisplay(message)}
            {edited && (
              <span className="mt-1 block text-[10px] text-muted-foreground">Edited</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
