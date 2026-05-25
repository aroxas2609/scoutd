# Performance baseline (Discover)

Record before/after when tuning load time. Use Chrome DevTools → Network, filter `rest/v1`.

## Local production build

```bash
npm run build && npm run start
```

## Scenarios

| Scenario | What to count | Target (warm) |
|----------|---------------|---------------|
| `/search` browse (default) | Supabase REST calls until Featured visible | ≤ 4 critical path |
| `/search` + Nearby chip | Extra calls on toggle | ≤ 2 incremental |
| Open player profile (coach) | GET player + writes | 1 GET + profile_views (async) |

## Notes

- Dev (`npm run dev`) adds Next/HMR overhead; compare prod build for real UX.
- Supabase free tier: first request after idle may add 1–3s cold start (dashboard → project activity).
