-- V5: Matching Run Persistence and Idempotency

ALTER TABLE matching_run ADD COLUMN registry_version_id INT;
ALTER TABLE matching_run ADD COLUMN fingerprint_version INT;
ALTER TABLE matching_run ADD COLUMN model_name VARCHAR(100);
ALTER TABLE matching_run ADD COLUMN model_version VARCHAR(50);
ALTER TABLE matching_run ADD COLUMN correlation_id UUID;
ALTER TABLE matching_run ADD COLUMN result_json JSONB;

-- Add index for idempotency and latest lookups
CREATE INDEX idx_matching_run_problem ON matching_run(problem_id);
CREATE INDEX idx_matching_run_idempotency ON matching_run(problem_id, fingerprint_version, registry_version_id, algorithm_version);
