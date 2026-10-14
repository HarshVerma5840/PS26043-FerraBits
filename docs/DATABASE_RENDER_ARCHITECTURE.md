# SAAMYUKT — Render PostgreSQL Architecture & Migration Strategy

## 1. Architectural Strategy Comparison

When deploying the SAAMYUKT microservice reactor to Render Managed PostgreSQL, three architectural approaches were evaluated:

| Approach | Description | Monthly Cost | Operational Complexity | Migration Automation | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1: Single Cluster, Isolated Schemas** *(Recommended)* | One PostgreSQL database (`saamyukt`) hosting 6 isolated schema namespaces (`sih_source`, `sih_problem`, `sih_eval`, `sih_portal`, `sih_codejudge`, `sih_capability`). | 1 Managed Instance ($7–$20/mo) | **Low** — single connection string, centralized backups, unified metrics. | **100% Autonomous** — Flyway creates schemas automatically via `create-schemas: true`. | **Selected Production Architecture** |
| **Option 2: Single Cluster, Multiple Databases** | One PostgreSQL cluster hosting 6 explicitly created databases (`sih_source`, `sih_problem`, etc.). | 1 Managed Instance ($7–$20/mo) | **Medium** — requires manual `CREATE DATABASE` execution on first provision. | **Semi-Manual** — Render Blueprints do not run init scripts automatically. | **Supported Alternative** |
| **Option 3: Multiple Render Postgres Instances** | 6 separate Render Managed PostgreSQL database clusters. | 6 Managed Instances ($42–$120/mo) | **High** — 6 separate backup schedules, connection pools, and monitoring streams. | **High Cost** — 90%+ RAM wasted on empty engine overhead. | **Not Recommended** |

---

## 2. Table Name Collision Audit

Running all 6 microservices in the `public` schema of a single database would cause collisions. Static audit of all Flyway migrations revealed:

```
Colliding Tables Across Services:
  - 'audit_log': Defined in BOTH problem-service and evaluation-service
  - 'evaluation_status_history': Defined in BOTH evaluation-service and codejudge-service
  - 'team': Defined in BOTH portal-service and capability-matching-service
  - 'team_member': Defined in BOTH portal-service and capability-matching-service
  - 'flyway_schema_history': Default migration history table
```

### How Option 1 Solves Collisions:
By configuring:
1. `DB_URL: jdbc:postgresql://saamyukt-postgres:5432/saamyukt?currentSchema=sih_<service>`
2. `spring.flyway.schemas: sih_<service>`
3. `spring.flyway.default-schema: sih_<service>`
4. `spring.flyway.create-schemas: true`
5. `spring.jpa.properties.hibernate.default_schema: sih_<service>`

Each microservice is bound strictly to its own namespace. Flyway manages `<schema>.flyway_schema_history` and creates all tables inside that schema with zero cross-contamination.

---

## 3. PostGIS & Database Extensions Audit

- **Audit Result**: **No PostGIS extension or custom C-extensions are required.**
- **Details**:
  - The legacy monolith previously used PostGIS `geometry` columns, but during the microservices refactoring, spatial coordinates were standardized to high-precision `DECIMAL(10,8)` columns (`latitude`, `longitude`).
  - Spatial radius queries (e.g. `GET /problems/nearby`) use standard trigonometric Haversine spherical math directly in JPQL/SQL (`acos`, `cos`, `sin`, `radians`).
  - Standard PostgreSQL 16 on Render natively supports all required queries without custom images.

---

## 4. DDL & Migration Safety

- **`ddl-auto: validate`**: All 6 microservices enforce `hibernate.ddl-auto: validate`. Hibernate is strictly prohibited from mutating production schemas.
- **Flyway Lifecycle**: Flyway executes prior to Hibernate validation. It automatically creates the schema on startup, applies pending migrations monotonically (`V1` $\rightarrow$ `V2` $\rightarrow$ `Vn`), and records checksums.
- **`baseline-on-migrate: true`**: Configured on all services to prevent startup failures on pre-existing databases.

---

## 5. Deployment Guide

### Option 1 (Recommended — Fully Automated via Render Blueprint)
No manual SQL steps required.
1. Link repository to Render and create a new **Blueprint**.
2. Render creates the `saamyukt-postgres` database cluster.
3. As each microservice starts up, Flyway creates its respective schema (`sih_source`, `sih_problem`, etc.) and runs all migrations automatically.

### Option 2 (Alternative — Dedicated Database per Service on Same Cluster)
If physical database isolation is required on the single cluster:
1. Connect to the Render PostgreSQL instance using `psql`:
   ```bash
   psql "postgres://sih:<PASSWORD>@saamyukt-postgres:5432/saamyukt"
   ```
2. Execute the initialization script:
   ```sql
   \i db/init/01-create-service-dbs.sql
   ```
3. Update `DB_URL` in `render.yaml` or Render Dashboard to point to `jdbc:postgresql://saamyukt-postgres:5432/sih_<service>` and set `DB_SCHEMA=public`.
