-- ==============================================================================
-- SAAMYUKT (SIH PS26043) — Schema Provisioning for Single Database Mode
--
-- Safest Render Production Approach (Option 1):
-- When all microservices share a single managed PostgreSQL cluster (e.g. 'saamyukt'),
-- each microservice owns an isolated schema namespace to prevent table collisions.
--
-- Colliding tables prevented by schema namespaces:
--   - audit_log (problem-service vs evaluation-service)
--   - evaluation_status_history (evaluation-service vs codejudge-service)
--   - team, team_member (portal-service vs capability-matching-service)
--   - flyway_schema_history (isolated per schema)
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS sih_source;
CREATE SCHEMA IF NOT EXISTS sih_problem;
CREATE SCHEMA IF NOT EXISTS sih_eval;
CREATE SCHEMA IF NOT EXISTS sih_portal;
CREATE SCHEMA IF NOT EXISTS sih_codejudge;
CREATE SCHEMA IF NOT EXISTS sih_capability;
