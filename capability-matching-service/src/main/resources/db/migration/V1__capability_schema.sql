-- V1: Capability Registry Schema for Capability Matching Service

CREATE TABLE registry_version (
    version_id SERIAL PRIMARY KEY,
    version_name VARCHAR(50) NOT NULL UNIQUE,
    published_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE institution (
    institution_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    aishe_identifier VARCHAR(50),
    state VARCHAR(100),
    district VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    imported_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    raw_import_data JSONB,
    registry_version_id INT REFERENCES registry_version(version_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE department (
    department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE faculty (
    faculty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    workload_capacity_pct INT NOT NULL DEFAULT 100,
    current_workload_pct INT NOT NULL DEFAULT 0,
    past_performance_score DOUBLE PRECISION NOT NULL DEFAULT 0.5
);

CREATE TABLE student (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    degree_level VARCHAR(50)
);

CREATE TABLE lab (
    lab_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE equipment (
    equipment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID NOT NULL REFERENCES lab(lab_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_operational BOOLEAN NOT NULL DEFAULT TRUE,
    -- tsvector for sparse lexical search
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED,
    UNIQUE(lab_id, name) -- Prevent duplicates in the same lab
);
CREATE INDEX idx_equipment_search ON equipment USING GIN(search_vector);

CREATE TABLE skill (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    -- tsvector for sparse lexical search
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
CREATE INDEX idx_skill_search ON skill USING GIN(search_vector);

CREATE TABLE faculty_skill (
    faculty_id UUID NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skill(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50),
    PRIMARY KEY (faculty_id, skill_id)
);

CREATE TABLE student_skill (
    student_id UUID NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skill(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50),
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE team (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE team_member (
    team_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES team(team_id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    student_id UUID REFERENCES student(student_id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    -- Ensure a member is either faculty or student, but not both or neither
    CHECK ((faculty_id IS NOT NULL AND student_id IS NULL) OR (faculty_id IS NULL AND student_id IS NOT NULL))
);

CREATE TABLE past_project (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    performance_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    completed_at TIMESTAMPTZ
);

CREATE TABLE matching_run (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL,
    algorithm_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- We store embeddings as JSON arrays since pgvector isn't guaranteed.
CREATE TABLE capability_profile (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(institution_id) ON DELETE CASCADE,
    profile_text TEXT NOT NULL,
    embedding_vector JSONB,
    version INT NOT NULL DEFAULT 1
);
