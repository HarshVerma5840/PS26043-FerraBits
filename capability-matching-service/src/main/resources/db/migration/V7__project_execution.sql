CREATE TABLE active_project (
    project_id UUID PRIMARY KEY,
    problem_id UUID NOT NULL,
    institution_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_milestone (
    milestone_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_task (
    task_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestone(milestone_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id UUID,
    priority VARCHAR(50),
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    position_index INT NOT NULL DEFAULT 0,
    attachments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_activity (
    activity_id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES project_task(task_id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE field_test (
    test_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    test_plan TEXT,
    location VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    observations TEXT,
    evidence TEXT,
    result VARCHAR(50),
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deployment (
    deployment_id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES active_project(project_id) ON DELETE CASCADE,
    deployment_target VARCHAR(255),
    deployment_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    version VARCHAR(100),
    responsible_team VARCHAR(255),
    verification_notes TEXT,
    rollback_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
