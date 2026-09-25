# Capability Matching Service

This service (port `8086`) manages the institution registry and performs semantic and sparse capability matching against submitted problem statements.

## API Contracts & Canonical Routing

All endpoints are exposed through the API Gateway (Caddy) under the `/capability` prefix.

### 1. Capability Matching (Runs)
- `POST /capability/runs`
  - Body: `{ "problemId": "UUID" }`
  - Executes a hybrid matching algorithm.
  - Requires authenticated internal/admin/reviewer access.

### 2. Registry Management
- `GET /capability/registry`
  - Returns a list of all registry versions.
  - Requires authenticated access.
- `POST /capability/registry/import`
  - Body: `RegistryImportRequest` (containing an array of institution capabilities)
  - Validates and imports institutions into a new, inactive registry version.
  - Requires `ADMIN` access.
- `POST /capability/registry/publish?versionId={id}`
  - Activates the specified registry version and makes it the active target for matching execution.
  - Idempotent.
  - Requires `ADMIN` access.

## Configuration

The service leverages a hybrid embedding strategy for matching. The embedding provider can be explicitly configured via `application.yml`:

```yaml
embedding:
  provider: mock # Options: 'mock' or 'http'
  api:
    url: "http://host.docker.internal:20128/v1/embeddings" # Required if provider is 'http'
    key: "sk-..." # Optional
```

- `provider=mock`: Selects the `MockEmbeddingProvider`. Ideal for local development or CI where a real embedding service is unavailable.
- `provider=http`: Selects the `HttpEmbeddingProvider`. Must provide `embedding.api.url`.

The service performs hybrid search leveraging PostgreSQL's native full-text search (`ts_rank`) alongside semantic embeddings. 

**Note on Scalability & Infrastructure:**
- Vector matching is performed using an in-memory Java cosine similarity calculator running against JSONB vectors mapped via `EmbeddingRecord`.
- Production scale capabilities using `pgvector` or formal `BM25` metrics are NOT active in this iteration.
- AISHE integrations are offline-only, requiring manual registry import flows via the `ADMIN` endpoint.
