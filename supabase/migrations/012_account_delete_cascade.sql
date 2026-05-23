-- Allow profile deletion when user was a verification reviewer
ALTER TABLE verification_requests
  DROP CONSTRAINT IF EXISTS verification_requests_reviewed_by_fkey;

ALTER TABLE verification_requests
  ADD CONSTRAINT verification_requests_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
