-- Speed up get_conversation_previews and get_unread_message_count

CREATE INDEX IF NOT EXISTS idx_cp_user_inbox
  ON conversation_participants (user_id, archived_at, conversation_id)
  INCLUDE (last_read_at);

CREATE INDEX IF NOT EXISTS idx_messages_conv_sender_created
  ON messages (conversation_id, sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cp_conversation_user
  ON conversation_participants (conversation_id, user_id);
