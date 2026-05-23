-- Allow senders to edit and delete their own text messages
-- Run in Supabase SQL Editor

DROP POLICY IF EXISTS "Senders update own messages" ON messages;
CREATE POLICY "Senders update own messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  sender_id = auth.uid()
  AND type = 'text'
  AND public.is_conversation_member(conversation_id)
)
WITH CHECK (
  sender_id = auth.uid()
  AND type = 'text'
);

DROP POLICY IF EXISTS "Senders delete own messages" ON messages;
CREATE POLICY "Senders delete own messages"
ON messages
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  AND type = 'text'
  AND public.is_conversation_member(conversation_id)
);
