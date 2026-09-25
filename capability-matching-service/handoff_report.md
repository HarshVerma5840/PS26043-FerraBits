# Batch 3 Handoff Report: Capability Registry & Evidence-Backed Matching

## 1. Completed Registry Capabilities
- Created robust schema and object model for `Institution`, `Department`, `Faculty`, `Student`, `Lab`, `Equipment`, `Skill`, `Team`.
- Support for complex hierarchical capability relationships.
- Capacity threshold limits (`currentWorkloadPct` vs `capacityThreshold`).
- Geographic coordinate integrations (`latitude`, `longitude`).
- Integrated verification and activity states.

## 2. Search Strategy Implemented
A hybrid multi-objective retrieval pipeline was created:
1. **Dense Retrieval:** Extracts K-nearest semantic matches using localized JSONB vectors based on string embeddings of text configurations.
2. **Sparse Retrieval:** Executes a CTE-backed PostgreSQL `tsvector` query matching anchored lexical demands using `phraseto_tsquery`.
3. **Reciprocal Rank Fusion:** Smoothly blends the sets to compute overall relevancy.
4. **Reranking:** Re-scores the fused pool using multi-objective metrics mapping geographic penalty distances, operational capacity ratios, and historical performance tracking.

## 3. PostgreSQL Full-Text Search and Vector Settings
- **PostgreSQL Full-Text Search and ts_rank:** True BM25 is not natively packaged in standard PostgreSQL. The `SparseCapabilityRetriever` leverages Postgres’ robust FTS native function `ts_rank` which mimics tf-idf properties.
- **JSONB/in-memory embeddings:** `pgvector` is not enabled. We use a fallback mechanism persisting arrays into a `JSONB` column (`EmbeddingRecord.vector_json`) paired with an efficient in-memory Java dot-product cosine algorithm to unblock semantic calculations.
- **Mock vs HTTP Embedding Providers:** Configured via `application.yml` (`embedding.provider`). `mock` selects `MockEmbeddingProvider` for offline testing. `http` targets an external endpoint (configured via `embedding.api.url`). Without a URL, startup cleanly fails. 
- **AISHE Integration:** Active AISHE network HTTP calls are not implemented. Seeded offline data or manual imports are currently used.

## 4. Registry Version Lifecycle
- Imported registries (`/capability/registry/import`) always start as completely inactive.
- Activation requires an explicit `/capability/registry/publish?versionId={id}` action.
- Publishing automatically handles the deactivation of previous active registry states.

## 5. API Endpoints
- `POST /capability/runs`
- `GET  /capability/runs/{matchingRunId}`
- `GET  /capability/problems/{problemId}/latest`
- `POST /capability/registry/import`
- `GET  /capability/registry`
- `POST /capability/registry/publish`

## 6. Authentication Requirements
- Core endpoints are protected behind a JWT Filter (`JwtAuthFilter`).
- Requires a `Bearer` token with:
  - `sub`: Must be a valid UUID.
  - `iss`: Must exactly match the configuration (e.g. `sih26043`).
  - `role`: Must be `ADMIN` (for `/registry` endpoints) or `SUBMITTER`/`REVIEWER` for matching evaluation.
- Failure to comply triggers a `403 Forbidden` translation via Caddy API Gateway proxy mapping.

## 7. Algorithm Version
- Dynamically mapped against the `AlgorithmConfig` entity.
- Defaults to `v1.0.0-fallback` if no active configurations exist.
- Persisted against `MatchingRun` outputs deterministically.

## 8. Configurable Weights
Weights are fully separated in the database (`algorithm_config`) and map by default as:
- Semantic Fit: `0.25`
- Skill Alignment: `0.20`
- Infrastructure/Equipment: `0.20`
- Past Performance: `0.15`
- Capacity: `0.10`
- Geography: `0.10`

## 9. Batch 2 Input Requirements (Problem Fingerprint)
Accepts:
- Core Identifiers: `problemId`, `fingerprintVersion`
- Geographic Mapping: `latitude`, `longitude`, `maxDistanceKm`
- Semantic Data: `domain`, `subDomain`
- Capability Targeting: Array of `RequiredCapability` (skills) and `requiredEquipment` strings.

## 10. Batch 4 Handoff Contract
Returns `MatchResult` encapsulating:
- Raw `overallScore` mapped 1-100 (deterministic UUID tie-breaking enabled)
- `ScoreBreakdown` describing each objective axis mapping.
- Array of `MatchedInstitution`.
- Synthesized `TeamSynthesisResult` containing localized recommended groupings of `FACULTY` and `STUDENT`s with masked identifiers for privacy.
- Immutable `evidence` card array identifying exact rationalizations behind choices.

## 11. Known Limitations & Scalability
- Vector search runs in the Java JVM runtime using JSONB arrays. Massive scaling beyond 10,000+ localized documents will degrade response time linearly without `pgvector`.
- Geographic calculations utilize in-memory Java Haversine math.
- True BM25 scoring is missing and relies heavily on baseline `ts_rank`.

## 12. Test Setup
- Integration via local docker daemon (`docker-compose`).
- Relies on Flyway migrations to establish initial schema.
- Accessible via API Gateway (`http://localhost:8080/capability/...`) or via direct service bypass (`http://localhost:8086/capability/...`).
