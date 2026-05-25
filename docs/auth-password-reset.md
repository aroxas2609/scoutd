# Password reset (PWA / cross-browser)

Scoutd uses Supabase **`token_hash`** recovery links so a reset works when the email opens in a different app than where you requested it (e.g. home-screen PWA vs Mail → Safari).

## 1. Supabase email template (required)

**Authentication → Email Templates → Reset password**

Replace the default link (`{{ .ConfirmationURL }}`) with a direct app link:

**Subject:** `Reset your Scoutd password`

**Body (HTML example):**

```html
<h2>Scoutd</h2>
<p>We received a request to reset the password for {{ .Email }}.</p>
<p>
  <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">
    Set a new password
  </a>
</p>
<p>If you did not request this, you can ignore this email.</p>
```

`{{ .RedirectTo }}` is the URL from `resetPasswordForEmail` (e.g. `https://scoutd88.vercel.app/update-password`).

Do **not** use only `{{ .ConfirmationURL }}` for production if you need PWA/cross-browser resets—that flow uses PKCE and requires the same browser.

## 2. Redirect URLs

Allow `https://your-domain/update-password**` (and `http://localhost:3000/update-password**` for local dev). See [README](../README.md).

## 3. User flow

1. Request reset from the PWA or browser.
2. Open the email link (any browser or the PWA is fine).
3. Land on `/update-password`, set a new password.
4. Open Scoutd from the home screen and sign in.

Reference: [Supabase password auth](https://supabase.com/docs/guides/auth/passwords), [PKCE vs same device](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
