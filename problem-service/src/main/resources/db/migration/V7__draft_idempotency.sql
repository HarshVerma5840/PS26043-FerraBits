-- V7: Idempotency Key for Citizen Drafts
--
-- Adds:
--   * idempotency_key to problem table
--   * unique index on (submitted_by_user_id, idempotency_key) to prevent accidental duplicate submissions
-- ---------------------------------------------------------------------------

ALTER TABLE problem ADD COLUMN idempotency_key VARCHAR(100);

-- Unique index so that a user cannot submit two problems with the same idempotency key
CREATE UNIQUE INDEX idx_problem_idempotency ON problem (submitted_by_user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
