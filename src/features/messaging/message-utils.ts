import type { Message } from "@/types/database";

export function isMessageEdited(message: Message) {
  return Boolean(message.metadata?.edited_at) && !isMessageDeleted(message);
}

export function isMessageDeleted(message: Message) {
  return Boolean(message.metadata?.deleted_at);
}

export function messageBodyDisplay(message: Message) {
  if (isMessageDeleted(message)) return "This message was deleted";
  return message.body;
}
