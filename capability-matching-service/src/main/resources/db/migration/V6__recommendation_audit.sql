CREATE TABLE recommendation_decision_audit (
    id UUID PRIMARY KEY,
    matching_run_id UUID NOT NULL REFERENCES matching_run(run_id),
    problem_id UUID NOT NULL,
    decision VARCHAR(50) NOT NULL,
    original_institution_id UUID,
    selected_institution_id UUID,
    actor_id UUID NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    reason TEXT,
    request_metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    previous_hash VARCHAR(255) NOT NULL,
    current_hash VARCHAR(255) NOT NULL
);

CREATE INDEX idx_recomm_audit_problem ON recommendation_decision_audit(problem_id);
CREATE INDEX idx_recomm_audit_created ON recommendation_decision_audit(created_at DESC);
