# Deploy message-push Edge Function and set secrets from .env.local
# Prerequisite: npx supabase login  (once per machine)
#
# Usage: .\scripts\deploy-message-push.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Read-EnvFile([string]$path) {
  $env = @{}
  if (-not (Test-Path $path)) { return $env }
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $key = $line.Substring(0, $eq).Trim()
    $val = $line.Substring($eq + 1).Trim()
    if (
      ($val.StartsWith('"') -and $val.EndsWith('"')) -or
      ($val.StartsWith("'") -and $val.EndsWith("'"))
    ) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    if (-not $env.ContainsKey($key)) { $env[$key] = $val }
  }
  return $env
}

$local = Read-EnvFile ".env.local"
$projectRef = "wqpooxjzuzdishjnkkvs"
if ($local.NEXT_PUBLIC_SUPABASE_URL -match "https://([a-z0-9]+)\.supabase\.co") {
  $projectRef = $Matches[1]
}

$publicKey = $local.NEXT_PUBLIC_VAPID_PUBLIC_KEY
$privateKey = $local.VAPID_PRIVATE_KEY
$subject = $local.VAPID_SUBJECT
$webhookSecret = $local.PUSH_WEBHOOK_SECRET

if (-not $publicKey -or -not $privateKey) {
  Write-Error "Missing VAPID keys in .env.local. Run: npx web-push generate-vapid-keys"
}
if (-not $webhookSecret) {
  Write-Error "Missing PUSH_WEBHOOK_SECRET in .env.local"
}
if (-not $subject) { $subject = "mailto:support@scoutd.app" }

Write-Host "Project: $projectRef"
Write-Host "Setting Edge Function secrets..."
npx supabase secrets set `
  --project-ref $projectRef `
  "VAPID_PUBLIC_KEY=$publicKey" `
  "VAPID_PRIVATE_KEY=$privateKey" `
  "VAPID_SUBJECT=$subject" `
  "PUSH_WEBHOOK_SECRET=$webhookSecret"

Write-Host "Deploying message-push (no JWT verify; webhook uses shared secret)..."
npx supabase functions deploy message-push `
  --project-ref $projectRef `
  --no-verify-jwt

Write-Host "Linking project (if needed)..."
npx supabase link --project-ref $projectRef --yes 2>$null | Out-Null

Write-Host "Applying message-push DB trigger (027)..."
npx supabase db query --linked -f "supabase/migrations/027_message_push_webhook.sql"

Write-Host "Storing push_webhook_secret in app_private_config..."
node "scripts/configure-message-push-secret.mjs"

$fnUrl = "https://$projectRef.supabase.co/functions/v1/message-push"
Write-Host ""
Write-Host "Done. Function URL:"
Write-Host $fnUrl
Write-Host ""
Write-Host "Database trigger messages_push_webhook calls the function on each text message INSERT."
Write-Host ('Header x-push-webhook-secret is set from app_private_config (value matches .env.local).')
