-- V2: Seeded Capability Registry

INSERT INTO registry_version (version_name, published_at, is_active) VALUES
    ('v1.0.0', now(), TRUE);

INSERT INTO institution (institution_id, name, type, aishe_identifier, state, district, latitude, longitude, verification_status, active_status, source, registry_version_id, imported_at, verified_at) VALUES
    ('30000000-0000-4000-8000-000000000001', 'Indian Institute of Technology Madras', 'CENTRAL_UNIV', 'U-0456', 'Tamil Nadu', 'Chennai', 12.9915, 80.2336, 'VERIFIED', TRUE, 'SEEDED', 1, now(), now()),
    ('30000000-0000-4000-8000-000000000002', 'Indian Institute of Technology Delhi', 'CENTRAL_UNIV', 'U-0042', 'Delhi', 'New Delhi', 28.5450, 77.1926, 'VERIFIED', TRUE, 'SEEDED', 1, now(), now()),
    ('40000000-0000-4000-8000-000000000001', 'Example University', 'STATE_UNIV', 'U-9999', 'Jharkhand', 'Ranchi', 23.3400, 85.3100, 'VERIFIED', TRUE, 'SEEDED', 1, now(), now());

INSERT INTO department (department_id, institution_id, name, description) VALUES
    ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Civil Engineering', 'Focus on water and structural engineering'),
    ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', 'Computer Science', 'Focus on IoT and AI');

INSERT INTO faculty (faculty_id, department_id, name, workload_capacity_pct, current_workload_pct, past_performance_score) VALUES
    ('60000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'Dr. Smith', 100, 20, 0.95),
    ('60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', 'Dr. Jones', 100, 90, 0.80);

INSERT INTO student (student_id, institution_id, name, degree_level) VALUES
    ('70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Alice', 'PG'),
    ('70000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', 'Bob', 'UG');

INSERT INTO lab (lab_id, institution_id, name) VALUES
    ('80000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Water Quality Lab'),
    ('80000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', 'IoT Lab');

INSERT INTO equipment (equipment_id, lab_id, name, is_operational) VALUES
    ('90000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', 'Water testing kit', TRUE),
    ('90000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000001', 'Spectrometer', FALSE),
    ('90000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000002', 'IoT sensors', TRUE);

INSERT INTO skill (skill_id, name) VALUES
    ('A0000000-0000-4000-8000-000000000001', 'Water Quality Testing'),
    ('A0000000-0000-4000-8000-000000000002', 'IoT Sensor Integration'),
    ('A0000000-0000-4000-8000-000000000003', 'UI development');

INSERT INTO faculty_skill (faculty_id, skill_id, proficiency_level) VALUES
    ('60000000-0000-4000-8000-000000000001', 'A0000000-0000-4000-8000-000000000001', 'EXPERT'),
    ('60000000-0000-4000-8000-000000000002', 'A0000000-0000-4000-8000-000000000002', 'ADVANCED');

INSERT INTO student_skill (student_id, skill_id, proficiency_level) VALUES
    ('70000000-0000-4000-8000-000000000001', 'A0000000-0000-4000-8000-000000000001', 'INTERMEDIATE'),
    ('70000000-0000-4000-8000-000000000002', 'A0000000-0000-4000-8000-000000000003', 'BEGINNER');

INSERT INTO team (team_id, institution_id, name, description) VALUES
    ('B0000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Water AI Solvers', 'Multidisciplinary team for water and IoT');

INSERT INTO team_member (team_id, faculty_id, student_id, role) VALUES
    ('B0000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', NULL, 'LEAD'),
    ('B0000000-0000-4000-8000-000000000001', NULL, '70000000-0000-4000-8000-000000000001', 'MEMBER');

INSERT INTO past_project (project_id, institution_id, title, description, performance_score) VALUES
    ('C0000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Smart Water Monitoring', 'Deployed IoT in 10 villages', 0.95);

INSERT INTO capability_profile (institution_id, profile_text, embedding_vector) VALUES
    ('40000000-0000-4000-8000-000000000001', 'Example University offers comprehensive research in water quality testing and IoT integration.', '[0.1, 0.2, 0.3]');
