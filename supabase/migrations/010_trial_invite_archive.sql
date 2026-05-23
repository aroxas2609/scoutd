-- Per-user archive for trial invites + delete for participants
-- Run in Supabase SQL Editor

ALTER TABLE trial_invites
ADD COLUMN IF NOT EXISTS coach_archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS player_archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_trial_invites_coach_archived
ON trial_invites (coach_id, coach_archived_at);

CREATE INDEX IF NOT EXISTS idx_trial_invites_player_archived
ON trial_invites (player_id, player_archived_at);

DROP POLICY IF EXISTS "Participants delete trial invite" ON trial_invites;
CREATE POLICY "Participants delete trial invite"
ON trial_invites
FOR DELETE
TO authenticated
USING (auth.uid() = coach_id OR auth.uid() = player_id);
