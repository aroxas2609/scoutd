-- Lightweight unread badge for nav (no conversation preview hydration)

CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM messages m
  INNER JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE cp.user_id = auth.uid()
    AND cp.archived_at IS NULL
    AND m.sender_id IS DISTINCT FROM auth.uid()
    AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at);
$$;

GRANT EXECUTE ON FUNCTION get_unread_message_count() TO authenticated;
