CREATE TABLE industry_organization (
    org_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_industry_participant (
    participant_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES industry_organization(org_id) ON DELETE CASCADE,
    contribution_type VARCHAR(100),
    deliverables TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_funding (
    funding_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES industry_organization(org_id) ON DELETE CASCADE,
    amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'INR',
    description TEXT,
    approval_state VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_mentorship (
    mentorship_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES industry_organization(org_id) ON DELETE CASCADE,
    mentor_user_id UUID,
    scope TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mentorship_session (
    session_id UUID PRIMARY KEY,
    mentorship_id UUID NOT NULL REFERENCES project_mentorship(mentorship_id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    commitments TEXT,
    completion_status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
