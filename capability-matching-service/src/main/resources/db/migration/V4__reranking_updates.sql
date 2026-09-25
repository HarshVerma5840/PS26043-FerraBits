-- V4: Reranking Updates & Algorithm Config

CREATE TABLE algorithm_config (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(50) NOT NULL UNIQUE,
    semantic_weight DECIMAL(3,2) NOT NULL DEFAULT 0.25,
    skill_weight DECIMAL(3,2) NOT NULL DEFAULT 0.20,
    infrastructure_weight DECIMAL(3,2) NOT NULL DEFAULT 0.20,
    past_performance_weight DECIMAL(3,2) NOT NULL DEFAULT 0.15,
    capacity_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    geography_weight DECIMAL(3,2) NOT NULL DEFAULT 0.10,
    capacity_threshold INT NOT NULL DEFAULT 100,
    max_distance_km DECIMAL(10,2) NOT NULL DEFAULT 500.0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO algorithm_config (version, semantic_weight, skill_weight, infrastructure_weight, past_performance_weight, capacity_weight, geography_weight, capacity_threshold, max_distance_km, active)
VALUES ('v1.0.0', 0.25, 0.20, 0.20, 0.15, 0.10, 0.10, 100, 500.0, true);
