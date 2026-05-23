-- Allow reading all participants in conversations you belong to (fixes "Scoutd user" / missing names)
-- Run in Supabase SQL Editor (requires 003 is_conversation_member function)

DROP POLICY IF EXISTS "Participants read own participant rows" ON conversation_participants;
DROP POLICY IF EXISTS "Participants read own" ON conversation_participants;

CREATE POLICY "Participants read conversation members"
ON conversation_participants
FOR SELECT
TO authenticated
USING (public.is_conversation_member(conversation_id));
