-- Fix infinite recursion in conversation_participants RLS
-- Run this in Supabase SQL Editor

DROP POLICY IF EXISTS "Participants read own" ON conversation_participants;

CREATE POLICY "Participants read own participant rows"
ON conversation_participants
FOR SELECT
USING (user_id = auth.uid());

-- Helper to check membership without recursive RLS (used by messages/conversations policies)
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Participants read conversations" ON conversations;
CREATE POLICY "Participants read conversations"
ON conversations
FOR SELECT
USING (public.is_conversation_member(id));

DROP POLICY IF EXISTS "Participants read messages" ON messages;
CREATE POLICY "Participants read messages"
ON messages
FOR SELECT
USING (public.is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Participants send messages" ON messages;
CREATE POLICY "Participants send messages"
ON messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_member(conversation_id)
);
