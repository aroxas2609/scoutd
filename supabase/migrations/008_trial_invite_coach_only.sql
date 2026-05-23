-- Trial invites: only coaches → players
DROP POLICY IF EXISTS "Coach create trial invite" ON trial_invites;

CREATE POLICY "Coach create trial invite"
ON trial_invites
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = coach_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'coach'
  )
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = player_id AND role = 'player'
  )
);
