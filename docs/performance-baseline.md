# Performance baseline

Record before/after when tuning load time. Use Chrome DevTools → Network, filter `rest/v1`.

## Local production build

```bash
npm run build && npm run start
```

## Discover

| Scenario | What to count | Target (warm) |
|----------|---------------|---------------|
| `/search` browse (default) | Supabase REST calls until Featured visible | ≤ 4 critical path |
| `/search` + Nearby chip | Extra calls on toggle | ≤ 2 incremental |
| Open player profile (coach) | GET player + writes | 1 GET + profile_views (async) |

## Messaging / Realtime

| Scenario | What to count | Notes |
|----------|---------------|-------|
| `/messages` inbox open | `get_conversation_previews` RPC count over 60s idle | Debounced Realtime invalidation (~800ms); `staleTime` 30s on inbox query |
| Same, two users chatting | Inbox still updates without full-table Realtime | Subscriptions use `conversation_id=in.(...)` for the viewer's threads only |
| Supabase Query Performance | `realtime.list_changes` calls/min | Drops when inbox no longer listens to all `messages` rows |

Manual check: one inbox tab, send 10 messages from another account in an existing thread — expect one debounced inbox refetch burst, not 10 immediate full inbox RPCs.

## Supabase Realtime tables (Dashboard)

**Not** the **Database → Replication** page (that is for read replicas / data warehouses).

Use **Database → Publications** → open `supabase_realtime` → allow only tables the app subscribes to:

| Table | In `supabase_realtime` | Used by |
|-------|------------------------|---------|
| `messages` | Yes | Inbox (filtered) + per-thread chat |
| `trial_invites` | Yes | Trials inbox (`useTrialsRealtime`) |
| Everything else | No | Reduces WAL / `list_changes` load |

SQL equivalent: `ALTER PUBLICATION supabase_realtime ADD TABLE messages;` (remove unused tables from the publication).

## Notes

- Dev (`npm run dev`) adds Next/HMR overhead; compare prod build for real UX.
- Supabase free tier: first request after idle may add 1–3s cold start (dashboard → project activity).
- Query stats like `pg_timezone_names` and `pg_available_extensions` come from the Supabase Dashboard / PostgREST schema cache — not Scoutd app traffic.
