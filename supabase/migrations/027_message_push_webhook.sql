-- Invoke message-push Edge Function after each new message (pg_net, async).
-- Set secret once: INSERT into app_private_config (see scripts/configure-message-push-db.sql)

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS app_private_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

ALTER TABLE app_private_config ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON app_private_config FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.trigger_message_push_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, pg_temp
AS $$
DECLARE
  webhook_secret text;
  payload jsonb;
  request_headers jsonb;
  edge_url text := 'https://wqpooxjzuzdishjnkkvs.supabase.co/functions/v1/message-push';
BEGIN
  IF NEW.type IS DISTINCT FROM 'text' THEN
    RETURN NEW;
  END IF;

  SELECT value INTO webhook_secret
  FROM public.app_private_config
  WHERE key = 'push_webhook_secret';

  IF webhook_secret IS NULL OR length(trim(webhook_secret)) = 0 THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', NULL
  );

  request_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-push-webhook-secret', webhook_secret
  );

  PERFORM net.http_post(
    url := edge_url,
    body := payload,
    headers := request_headers
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_push_webhook ON public.messages;

CREATE TRIGGER messages_push_webhook
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_message_push_webhook();
