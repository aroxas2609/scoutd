-- Run after migration 027. Replace __PUSH_WEBHOOK_SECRET__ before executing.
INSERT INTO public.app_private_config (key, value)
VALUES ('push_webhook_secret', '__PUSH_WEBHOOK_SECRET__')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
