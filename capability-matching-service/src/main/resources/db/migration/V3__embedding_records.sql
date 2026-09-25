-- V3: Embedding Records Schema

CREATE TABLE embedding_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    registry_version_id INT REFERENCES registry_version(version_id) ON DELETE CASCADE,
    content_hash VARCHAR(255) NOT NULL,
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    dimension INT,
    embedding_vector JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(entity_type, entity_id, registry_version_id)
);

CREATE INDEX idx_embedding_entity ON embedding_record(entity_type, entity_id);
CREATE INDEX idx_embedding_status ON embedding_record(status);
