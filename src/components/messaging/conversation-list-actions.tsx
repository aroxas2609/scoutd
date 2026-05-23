"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useArchiveConversation,
  useRemoveConversation,
  useUnarchiveConversation,
  type ConversationInboxFilter,
} from "@/features/messaging/hooks";

type Props = {
  conversationId: string;
  inboxFilter: ConversationInboxFilter;
};

export function ConversationListActions({ conversationId, inboxFilter }: Props) {
  const archive = useArchiveConversation();
  const unarchive = useUnarchiveConversation();
  const remove = useRemoveConversation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function handleArchive() {
    setMenuOpen(false);
    try {
      await archive.mutateAsync(conversationId);
      toast.success("Conversation archived");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not archive");
    }
  }

  async function handleUnarchive() {
    setMenuOpen(false);
    try {
      await unarchive.mutateAsync(conversationId);
      toast.success("Conversation restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restore");
    }
  }

  async function handleRemove() {
    try {
      await remove.mutateAsync(conversationId);
      setConfirmRemove(false);
      toast.success("Conversation removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      {confirmRemove && (
        <div className="w-44 rounded-xl border border-red-500/30 bg-red-500/10 p-2">
          <p className="text-xs text-red-200">Remove from your inbox?</p>
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => void handleRemove()}
              className="flex-1 rounded-md bg-red-500 px-2 py-1.5 text-[10px] font-semibold text-white"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              className="flex-1 rounded-md border border-white/20 px-2 py-1.5 text-[10px] text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white"
          aria-label="Conversation options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[var(--bg-graphite)]">
          {inboxFilter === "active" ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                void handleArchive();
              }}
            >
              <Archive className="h-4 w-4" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                void handleUnarchive();
              }}
            >
              <ArchiveRestore className="h-4 w-4" />
              Move to inbox
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              setConfirmRemove(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
