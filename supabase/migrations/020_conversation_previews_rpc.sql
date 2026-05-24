-- Efficient conversation inbox previews (last message + unread per thread)

CREATE OR REPLACE FUNCTION get_conversation_previews(p_inbox_filter text DEFAULT 'active')
RETURNS TABLE (
  conversation_id uuid,
  last_read_at timestamptz,
  conversation jsonb,
  other_user_id uuid,
  last_message_body text,
  last_message_sender_id uuid,
  last_message_created_at timestamptz,
  last_message_type message_type,
  last_message_metadata jsonb,
  unread_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH my_conversations AS (
    SELECT
      cp.conversation_id,
      cp.last_read_at,
      to_jsonb(c.*) AS conversation
    FROM conversation_participants cp
    INNER JOIN conversations c ON c.id = cp.conversation_id
    WHERE cp.user_id = auth.uid()
      AND (
        (p_inbox_filter = 'archived' AND cp.archived_at IS NOT NULL)
        OR (p_inbox_filter IS DISTINCT FROM 'archived' AND cp.archived_at IS NULL)
      )
  ),
  last_msgs AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.body,
      m.sender_id,
      m.created_at,
      m.type,
      m.metadata
    FROM messages m
    INNER JOIN my_conversations mc ON mc.conversation_id = m.conversation_id
    ORDER BY m.conversation_id, m.created_at DESC
  ),
  unread AS (
    SELECT
      m.conversation_id,
      COUNT(*)::bigint AS cnt
    FROM messages m
    INNER JOIN my_conversations mc ON mc.conversation_id = m.conversation_id
    WHERE m.sender_id IS DISTINCT FROM auth.uid()
      AND (mc.last_read_at IS NULL OR m.created_at > mc.last_read_at)
    GROUP BY m.conversation_id
  ),
  others AS (
    SELECT DISTINCT ON (cp.conversation_id)
      cp.conversation_id,
      cp.user_id AS other_user_id
    FROM conversation_participants cp
    INNER JOIN my_conversations mc ON mc.conversation_id = cp.conversation_id
    WHERE cp.user_id IS DISTINCT FROM auth.uid()
    ORDER BY cp.conversation_id, cp.user_id
  )
  SELECT
    mc.conversation_id,
    mc.last_read_at,
    mc.conversation,
    o.other_user_id,
    lm.body AS last_message_body,
    lm.sender_id AS last_message_sender_id,
    lm.created_at AS last_message_created_at,
    lm.type AS last_message_type,
    lm.metadata AS last_message_metadata,
    COALESCE(u.cnt, 0::bigint) AS unread_count
  FROM my_conversations mc
  LEFT JOIN others o ON o.conversation_id = mc.conversation_id
  LEFT JOIN last_msgs lm ON lm.conversation_id = mc.conversation_id
  LEFT JOIN unread u ON u.conversation_id = mc.conversation_id
  ORDER BY (mc.conversation->>'updated_at')::timestamptz DESC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION get_conversation_previews(text) TO authenticated;
