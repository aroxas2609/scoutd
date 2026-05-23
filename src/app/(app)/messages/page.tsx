"use client";

import { MessagesEmptyPane } from "@/components/messaging/messages-empty-pane";
import { MessagesInboxPanel } from "@/components/messaging/messages-inbox-panel";

export default function MessagesPage() {
  return (
    <>
      <div className="lg:hidden">
        <MessagesInboxPanel variant="page" />
      </div>
      <div className="hidden min-h-0 flex-1 lg:flex">
        <MessagesEmptyPane />
      </div>
    </>
  );
}
