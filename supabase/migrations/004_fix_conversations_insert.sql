-- Fix: "new row violates row-level security policy for table conversations"
-- Run in Supabase SQL Editor (after 003)

-- Conversations: allow create + update for authenticated users
DROP POLICY IF EXISTS "Authenticated create conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users create conversations" ON conversations;

CREATE POLICY "Authenticated users create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Members update conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (public.is_conversation_member(id))
WITH CHECK (public.is_conversation_member(id));

-- Participants: allow adding both users when starting a chat
DROP POLICY IF EXISTS "Insert participants" ON conversation_participants;
DROP POLICY IF EXISTS "Authenticated insert participants" ON conversation_participants;

CREATE POLICY "Authenticated insert participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Reliable way to start a chat (bypasses RLS edge cases)
CREATE OR REPLACE FUNCTION public.create_direct_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  new_id uuid;
  existing_id uuid;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF me = other_user_id THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  SELECT cp1.conversation_id
  INTO existing_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = me
    AND cp2.user_id = other_user_id
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO conversations (status)
  VALUES ('pending')
  RETURNING id INTO new_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (new_id, me),
    (new_id, other_user_id);

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_direct_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_direct_conversation(uuid) TO authenticated;
