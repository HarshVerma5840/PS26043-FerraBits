CREATE TYPE ai_processing_status AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING');

CREATE TABLE problem_processing_run (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problem(problem_id) ON DELETE CASCADE,
    status ai_processing_status NOT NULL DEFAULT 'PENDING',
    idempotency_key VARCHAR(100),
    retry_count INT NOT NULL DEFAULT 0,
    error_category VARCHAR(100),
    error_details JSONB,
    provider_metadata JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_processing_run_problem ON problem_processing_run (problem_id);
CREATE INDEX idx_processing_run_status ON problem_processing_run (status);

CREATE TABLE problem_language_artifact (
    artifact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES problem_processing_run(run_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problem(problem_id) ON DELETE CASCADE,
    source_language VARCHAR(50),
    original_content TEXT,
    transcribed_text TEXT,
    translated_text TEXT,
    translation_confidence DECIMAL(4,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_language_artifact_problem ON problem_language_artifact (problem_id);
CREATE UNIQUE INDEX uq_language_artifact_run ON problem_language_artifact (run_id);

CREATE TABLE problem_fingerprint_version (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES problem_processing_run(run_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problem(problem_id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    is_latest BOOLEAN NOT NULL DEFAULT FALSE,
    fingerprint_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fingerprint_version_problem ON problem_fingerprint_version (problem_id);
CREATE UNIQUE INDEX uq_fingerprint_version_latest ON problem_fingerprint_version (problem_id) WHERE is_latest = TRUE;
