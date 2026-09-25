CREATE TABLE citizen_feedback (
    feedback_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    user_id UUID, -- null if anonymous
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(100),
    comment TEXT,
    completion_usefulness VARCHAR(100),
    is_anonymous BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(50) DEFAULT 'PENDING',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    geohash VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_project ON citizen_feedback(project_id);
CREATE INDEX idx_feedback_status ON citizen_feedback(moderation_status);
CREATE INDEX idx_feedback_geohash ON citizen_feedback(geohash);
