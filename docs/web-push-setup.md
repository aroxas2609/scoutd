# Web Push setup (new messages)

Scoutd sends **Web Push** alerts when a new chat message is inserted. Delivery is server-side (Supabase Edge Function + Database Webhook), not from the sender’s browser.

## 1. Apply database migration

Run on your Supabase project:

- [`supabase/migrations/026_push_subscriptions.sql`](../supabase/migrations/026_push_subscriptions.sql)

Creates `push_subscriptions`, RLS, and a dedupe index on in-app `notifications` per `message_id`.

## 2. Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

| Secret / env | Where |
|--------------|--------|
| Public key | Next.js: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` |
| Private key | Supabase Edge Function secret: `VAPID_PRIVATE_KEY` |
| Public key (again) | Edge Function secret: `VAPID_PUBLIC_KEY` |
| Subject | Edge Function secret: `VAPID_SUBJECT` (e.g. `mailto:support@yourdomain.com`) |

Redeploy the Next.js app after setting `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

## 3. Deploy Edge Function

**One-time CLI login** (opens browser):

```bash
npx supabase login
```

**Windows (reads `.env.local`):**

```powershell
.\scripts\deploy-message-push.ps1
```

**Or manually:**

```bash
npx supabase link --project-ref wqpooxjzuzdishjnkkvs
npx supabase secrets set --project-ref wqpooxjzuzdishjnkkvs \
  VAPID_PUBLIC_KEY="..." VAPID_PRIVATE_KEY="..." VAPID_SUBJECT="mailto:..." \
  PUSH_WEBHOOK_SECRET="<long-random-string>"
npx supabase functions deploy message-push --project-ref wqpooxjzuzdishjnkkvs --no-verify-jwt
```

`--no-verify-jwt` is required so the Database Webhook can call the function with the shared secret header (not a user JWT).

Note the function URL, e.g.  
`https://<project-ref>.supabase.co/functions/v1/message-push`

## 4. Database trigger (recommended — in repo)

Migration [`027_message_push_webhook.sql`](../supabase/migrations/027_message_push_webhook.sql) adds a `pg_net` trigger on `messages` INSERT. It POSTs to `message-push` with `x-push-webhook-secret` from `app_private_config`.

`.\scripts\deploy-message-push.ps1` runs `db push` (linked project) and stores `push_webhook_secret`.

**Dashboard alternative:** Database → Webhooks → INSERT on `messages` with the function URL and header. Do not use both Dashboard webhooks and the SQL trigger (duplicate notifications).

## 5. Client behaviour

- Users enable push from **Messages** (banner) or **Profile → Account** (row).
- Service worker handles `push` and `notificationclick` in [`src/sw.ts`](../src/sw.ts).
- Serwist is **disabled in `npm run dev`** — test with:

```bash
npm run build && npm run start
```

Or your deployed HTTPS site. Local HTTP without a tunnel will not register push on some browsers.

## 6. iOS

- User must **Add to Home Screen** (iOS 16.4+).
- Then enable notifications in Scoutd.
- Safari-only tabs have limited push support.

## Test matrix

| Case | Expected |
|------|----------|
| Coach A sends message, Coach B backgrounded (B enabled push) | OS notification; tap opens `/messages/<id>` |
| Recipient actively in same thread (<60s read) | In-app notification row; **no** OS push |
| Permission denied | Banner hidden; settings row shows blocked |
| Invalid subscription (410) | Row removed from `push_subscriptions` |
| Webhook retry same `message_id` | Single in-app notification (unique index) |
| Message send from client | Message appears; inbox realtime; notification created by EF |

## Troubleshooting

- **No push, in-app notification works:** Webhook or VAPID secrets; check Edge Function logs.
- **Enable button does nothing in dev:** Use production build (see above).
- **No `NEXT_PUBLIC_VAPID_PUBLIC_KEY`:** UI hides push controls.
