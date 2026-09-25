-- V5: AI evaluation audit table.
--
-- Stores one row per pool per evaluation cycle that was attempted with an AI
-- provider (Gemini or OpenAI-compatible), regardless of whether it succeeded.
--
-- This is a separate concern from:
--   - problem_analysis (the advisory analysis step, not the scoring step)
--   - evaluation_response (the actual persisted criterion scores)
--   - audit_log (the generic entity audit trail)
--
-- Privacy: no API keys, no authorization headers, no problem text are stored here.
-- Only structural metadata about the AI call is kept for observability and
-- auditability of the AI scoring decision.

CREATE TABLE ai_evaluation_audit (
    audit_id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id             UUID            NOT NULL REFERENCES evaluation_cycle (cycle_id) ON DELETE CASCADE,
    -- The pool that was AI-scored (or attempted)
    evaluator_type       evaluator_type  NOT NULL,
    -- The provider that produced (or attempted to produce) the scorecard
    provider             VARCHAR(50)     NOT NULL,
    -- The model identifier (e.g. gemini-3.1-flash-lite)
    model                VARCHAR(100),
    -- The evaluation schema version used in the prompt
    evaluation_version   VARCHAR(20)     NOT NULL DEFAULT 'evaluation-v1',
    -- Rubric version (the V2 seed data migration)
    rubric_version       VARCHAR(20)     NOT NULL DEFAULT 'v2-seed',
    -- Wall-clock latency of the AI call in milliseconds (null on terminal failure)
    latency_ms           BIGINT,
    -- Whether the AI produced a usable scorecard (true) or the pool degraded to MANUAL
    ai_success           BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Whether a fallback was used (pool degraded from AUTO to MANUAL)
    fallback_used        BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Overall confidence as reported by Gemini (null for OpenAI-compatible provider)
    overall_confidence   DECIMAL(4,3),
    -- Number of criteria scored (0 on failure)
    criterion_count      INT             NOT NULL DEFAULT 0,
    -- Error category code when AI scoring failed (null on success)
    error_code           VARCHAR(50),
    -- Timestamp of the AI call attempt
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT now(),
    UNIQUE (cycle_id, evaluator_type)
);

CREATE INDEX idx_ai_evaluation_audit_cycle ON ai_evaluation_audit (cycle_id);
CREATE INDEX idx_ai_evaluation_audit_created ON ai_evaluation_audit (created_at);
CREATE INDEX idx_ai_evaluation_audit_provider ON ai_evaluation_audit (provider, ai_success);
