-- V8: Add client_upload_id to evidence
--
-- Enables idempotency for uploads from mobile clients with spotty networks.
-- ---------------------------------------------------------------------------

ALTER TABLE evidence ADD COLUMN client_upload_id VARCHAR(100);

-- Unique index so that an upload retry doesn't duplicate the evidence row
CREATE UNIQUE INDEX idx_evidence_client_upload ON evidence (problem_id, client_upload_id) WHERE client_upload_id IS NOT NULL;
