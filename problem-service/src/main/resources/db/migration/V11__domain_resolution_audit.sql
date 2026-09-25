-- V11: Domain Resolution Audit table.
-- Stores a record for every domain resolution attempt, including which provider
-- was used, whether fallback was triggered, confidence, and latency.
-- Privacy: no API keys, no authorization headers, no raw sensitive prompts are stored.

CREATE TABLE domain_resolution_audit (
    audit_id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id          UUID            NOT NULL REFERENCES problem(problem_id) ON DELETE CASCADE,
    -- The provider that produced the final answer
    provider            VARCHAR(50)     NOT NULL,
    -- The model identifier (null for deterministic provider)
    model               VARCHAR(100),
    -- Prompt/schema version for reproducibility
    classification_version VARCHAR(20)  NOT NULL DEFAULT 'domain-classifier-v1',
    -- Comma-separated resolved domain UUIDs (ordered by relevance)
    resolved_domain_ids JSONB           NOT NULL DEFAULT '[]',
    -- Confidence in [0.0, 1.0]; null when the provider does not expose confidence
    confidence          DECIMAL(4,3),
    -- Whether the primary AI provider failed and deterministic fallback was used
    fallback_used       BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Terminal outcome: SUCCESS | FALLBACK | FAILED
    resolver_status     VARCHAR(20)     NOT NULL,
    -- Error category code for observability (null on success)
    error_code          VARCHAR(50),
    -- Wall-clock latency of the LLM call in milliseconds (null for deterministic)
    latency_ms          BIGINT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_domain_resolution_audit_problem ON domain_resolution_audit (problem_id);
CREATE INDEX idx_domain_resolution_audit_created ON domain_resolution_audit (created_at);
