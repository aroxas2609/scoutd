-- Archive / leave conversations (per user)
-- Run in Supabase SQL Editor

ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "Leave conversation" ON conversation_participants;
CREATE POLICY "Leave conversation"
ON conversation_participants
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Rejoin existing 1:1 chats after leave; clear archive on open
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
    UPDATE conversation_participants
    SET archived_at = NULL
    WHERE conversation_id = existing_id
      AND user_id = me;
    RETURN existing_id;
  END IF;

  SELECT cp.conversation_id
  INTO existing_id
  FROM conversation_participants cp
  WHERE cp.user_id = other_user_id
    AND (
      SELECT COUNT(*)::int
      FROM conversation_participants cp3
      WHERE cp3.conversation_id = cp.conversation_id
    ) = 1
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (existing_id, me)
    ON CONFLICT (conversation_id, user_id) DO UPDATE
    SET archived_at = NULL;
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
