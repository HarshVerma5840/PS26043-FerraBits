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
2. **Sparse Retrieval:** Executes a CTE-backed PostgreSQL `tsvector` query matching anchored lexical demands (especially equipment matching using `phraseto_tsquery`).
3. **Reciprocal Rank Fusion:** Smoothly blends the sets to compute overall relevancy.
4. **Reranking:** Re-scores the fused pool using multi-objective metrics mapping geographic penalty distances, operational capacity ratios, and historical performance tracking.

## 3. pgvector Configuration Status
**Status: Disabled/Fallback**
`pgvector` is not enabled in the current `postgis/postgis:16-3.4` environment. The infrastructure fallback of persisting arrays into a `JSONB` column (`EmbeddingRecord.vector_json`) paired with an efficient in-memory Java dot-product cosine algorithm was implemented to unblock semantic calculations without native DB operator availability.

## 4. True BM25 Status
**Status: Simulated via ts_rank**
True BM25 is not natively packaged in standard PostgreSQL (requires `pg_search` or custom formulas). The `SparseCapabilityRetriever` leverages Postgres’ robust FTS native function `ts_rank` which maps tf-idf like properties minus global document length normalization.

## 5. Algorithm Version
- Dynamically mapped against the `AlgorithmConfig` entity.
- Defaults to `v1.0.0-fallback` if no active configurations exist.
- Persisted against `MatchingRun` outputs deterministically.

## 6. Configurable Weights
Weights are fully separated in the database (`algorithm_config`) and map by default as:
- Semantic Fit: `0.25`
- Skill Alignment: `0.20`
- Infrastructure/Equipment: `0.20`
- Past Performance: `0.15`
- Capacity: `0.10`
- Geography: `0.10`

## 7. New Tables and Indexes
- `institution`, `department`, `faculty`, `student`, `lab`, `equipment`, `faculty_skill`, `student_skill`
- `capability_import`, `embedding_record`
- `matching_run` (v5 enhancements for idempotent tracking and raw JSON caching)
- `algorithm_config`
- `registry_version`
- Indexes added for JSONB retrieval, `problem_id` lookups, and idempotent hashing constraints.

## 8. API Endpoints
- `POST /matching/runs`
- `GET  /matching/runs/{matchingRunId}`
- `GET  /matching/problems/{problemId}/latest`
- `POST /matching/registry/import`
- `GET  /matching/registry`
- `POST /matching/registry/publish`

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

## 11. Known Limitations
- Vector search runs in the Java JVM runtime. Massive scaling beyond 10,000+ localized documents will degrade response time linearly unless `pgvector` is installed.
- Geographic calculations utilize Java Haversine math.

## 12. Future Infrastructure Work
- Upgrade to `pgvector` container images.
- Transition `ts_rank` to a proper BM25 implementation logic.
- Integrate active AISHE network HTTP calls.
