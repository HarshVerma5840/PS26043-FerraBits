-- V6: Citizen Reporting & Intake (Batch 1).
--
-- Adds:
--   * DRAFT value to the problem_status enum
--   * DRAFT_CREATED / DRAFT_UPDATED audit actions
--   * upload_session table for resumable/chunked evidence uploads
--   * notification_event table for citizen-facing event log
-- ---------------------------------------------------------------------------

-- 1) Extend problem_status with DRAFT (before SUBMITTED in lifecycle order)
ALTER TYPE problem_status ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'SUBMITTED';

-- 2) Extend audit_action with draft-related actions
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'DRAFT_CREATED';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'DRAFT_UPDATED';

-- ---------------------------------------------------------------------------
-- upload_session: resumable/chunked upload tracking
-- ---------------------------------------------------------------------------

CREATE TABLE upload_session (
    session_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id     UUID         REFERENCES problem (problem_id) ON DELETE CASCADE,
    user_id        UUID         NOT NULL,
    filename       VARCHAR(500) NOT NULL,
    content_type   VARCHAR(100),
    evidence_type  evidence_type NOT NULL DEFAULT 'DOCUMENT',
    total_bytes    BIGINT       NOT NULL,
    uploaded_bytes BIGINT       NOT NULL DEFAULT 0,
    chunk_count    INT          NOT NULL DEFAULT 0,
    status         VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS'
                   CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED')),
    sha256_partial VARCHAR(64),
    storage_path   VARCHAR(500),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ  NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_upload_session_user    ON upload_session (user_id);
CREATE INDEX idx_upload_session_problem ON upload_session (problem_id);
CREATE INDEX idx_upload_session_status  ON upload_session (status);

-- ---------------------------------------------------------------------------
-- notification_event: citizen-facing notification log
-- ---------------------------------------------------------------------------

CREATE TABLE notification_event (
    event_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL,
    problem_id  UUID         REFERENCES problem (problem_id) ON DELETE SET NULL,
    event_type  VARCHAR(50)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_user    ON notification_event (user_id, created_at DESC);
CREATE INDEX idx_notification_problem ON notification_event (problem_id);
CREATE INDEX idx_notification_unread  ON notification_event (user_id) WHERE is_read = FALSE;
