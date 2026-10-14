# SAAMYUKT — Production Configuration & Security Guide for Render

This document audits and details all production security hardening, secrets management, CORS policies, storage decisions, and environment variables required for deploying SAAMYUKT on Render.

---

## 1. Secrets & Authentication Security

### A. JWT Configuration (`JWT_SECRET`)
- **Requirement**: Must be a cryptographically random secret string of at least 32 characters (256 bits) for HMAC-SHA256 signing (`Nimbus`-backed).
- **Enforcement**:
  - In `saamyukt-security/src/main/java/com/saamyukt/SIH26043/security/JwtService.java`, when `SPRING_PROFILES_ACTIVE=prod`, startup will throw an `IllegalStateException` and abort boot if `JWT_SECRET` is missing or shorter than 32 characters.
  - In `capability-matching-service`, the insecure fallback secret (`local-dev-only-...`) was completely removed.
- **Render Setup**: Defined in the `saamyukt-security-secrets` environment group with `sync: false`. Generated via:
  ```bash
  openssl rand -hex 32
  ```

### B. Identity Hashing Pepper (`IDENTITY_PEPPER`)
- **Requirement**: A secret salt/pepper of at least 16 characters mixed into HMAC-SHA256 hashing for citizen identity data (e.g. Aadhaar / Voter ID hashes).
- **Enforcement**: In `source-service/src/main/java/com/saamyukt/SIH26043/security/HmacHasher.java`, startup fails fast in production if `IDENTITY_PEPPER` is not provided or shorter than 16 characters.
- **Render Setup**: Defined in `saamyukt-security-secrets` (`sync: false`).

### C. Refresh Token Security
- **Mechanism**: Refresh tokens are cryptographically random UUIDs generated server-side and recorded in the PostgreSQL `refresh_token` table.
- **Single-Use Rotation**: Calling `POST /auth/refresh` immediately rotates the token — a new refresh token is issued, and the previous token is marked consumed or replaced.
- **Revocation**: Calling `POST /auth/logout` explicitly invalidates the refresh token in the database.
- **Expiry**: Managed by `app.refresh-token.ttl-days: 7` (7 days). Access tokens expire every 15 minutes (`app.jwt.access-token-ttl-minutes: 15`).

### D. OTP & Anti-Spoofing Configuration
- **Behavior in Production**:
  - The insecure development mock OTP code (`MOCK_OTP_CODE`) is completely disabled in production.
  - Cryptographically secure random 6-digit codes are generated via `SecureRandom`.
  - The OTP code is **never returned** in the API response (`prod ? null : code`).
  - Rate limiting is strictly enforced: 5 OTP challenges per phone number per hour.
  - Max 3 incorrect verification attempts before challenge lockout.
  - 5-minute TTL on OTP challenges.

---

## 2. Network, Routing & Gateway Hardening

### A. CORS Policy
- **Spring Boot Services**: All backend services use `@Profile("!prod")` on `CorsConfig`. When running under `SPRING_PROFILES_ACTIVE=prod`, wildcard development CORS (`*`) is completely disabled at the service level.
- **Gateway (Caddy)**:
  - When frontend and API share the same origin, no CORS is triggered.
  - When the frontend is deployed as an independent Render Static Site (`saamyukt-frontend.onrender.com`), the gateway handles CORS preflight (`OPTIONS`) and applies `Access-Control-Allow-Origin: {$CORS_ALLOWED_ORIGIN:*}`.
  - In production, set `CORS_ALLOWED_ORIGIN` in the Render Dashboard to your exact frontend domain (e.g. `https://saamyukt.onrender.com`).

### B. Admin & Registry Endpoint Protection
- **Eureka Registry Route Removed**: The public gateway (`gateway/Caddyfile`) previously routed `/eureka/**` to the internet. This was removed. The Eureka service registry runs as a Render Private Service (`eureka-server:8761`) accessible only within Render's internal private network.
- **Internal Microservice APIs**: Endpoints under `/internal/**` are never routed through Caddy and can only be accessed across internal ports over Render Private Networking.

---

## 3. Persistent File Storage Strategy

| Storage Mechanism | Use Case | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Render Persistent Disks** | Single-replica instance storage (`/data/evidence`, `/data/portal-files`, `/data/codejudge-workspaces`). | Immediate drop-in compatibility without code changes; POSIX filesystem; fast local I/O. | Disk is locked to a single instance; cannot scale horizontally; costs $0.25/GB/mo. | **Configured for Phase 1 Deployment** |
| **Object Storage (S3 / R2 / MinIO)** | Cloud-native asset storage for evidence uploads and portal submission attachments. | Infinite horizontal scalability; high durability; presigned direct client uploads; Cloudflare R2 has 0 egress fees. | Requires AWS S3 SDK integration in `EvidenceUploadService` and `PortalFileService`. | **Recommended Roadmap for Scale** |

### Configured Mounts in `render.yaml`:
1. `problem-service`: 10 GB disk mounted at `/data/evidence`.
2. `portal-service`: 10 GB disk mounted at `/data/portal-files`.
3. `codejudge-service`: 10 GB disk mounted at `/data/codejudge-workspaces`.

---

## 4. Logging & Error Sanitization

### A. Error Responses
- All 6 Spring Boot services configure:
  ```yaml
  server:
    error:
      include-stacktrace: never
      include-message: never
  ```
- All unhandled exceptions are caught by `GlobalExceptionHandler` and converted to RFC 7807 `ProblemDetail` responses with generic error classifications (`Unexpected error: <ClassName>`), ensuring zero database connection strings, SQL snippets, or internal stack traces are leaked to API callers.

### B. Logging Level
- Configured across all microservices:
  ```yaml
  logging:
    level:
      root: INFO
      org.springframework.web: WARN
      org.hibernate.SQL: WARN
  ```
- Prevents database SQL queries or sensitive payloads from being written into standard container stdout/Render log streams.

---

## 5. Render Environment Variables Reference

### Shared Environment Group: `saamyukt-security-secrets`
| Key | Type | Default / Required | Description |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Secret (`sync: false`) | **Required** | Minimum 32-character secret for HMAC-SHA256 JWT signing. |
| `IDENTITY_PEPPER` | Secret (`sync: false`) | **Required** | Minimum 16-character secret pepper for citizen identity hashes. |
| `SPRING_PROFILES_ACTIVE` | Config | `prod` | Activates production profile, disables mock OTP, disables dev CORS. |

### Shared Environment Group: `saamyukt-ai-config`
| Key | Type | Default / Required | Description |
| :--- | :--- | :--- | :--- |
| `OPENAI_API_KEY` | Secret (`sync: false`) | Optional | Production OpenAI / OpenRouter API Key. |
| `OPENAI_BASE_URL` | Config | `https://api.openai.com/v1` | Public OpenAI-compatible API base URL (replaces localhost). |
| `OPENAI_MODEL` | Config | `gpt-4o-mini` | Model for problem domain resolution and evaluation criteria. |
| `GEMINI_API_KEY` | Secret (`sync: false`) | Optional | Google Gemini API key. |
| `GEMINI_MODEL` | Config | `gemini-1.5-flash` | Gemini model name. |
| `AI_PROVIDER` | Config | `openai` | Domain resolution provider (`openai`, `gemini`, `deterministic`). |
| `AI_SCORING_PROVIDER`| Config | `openai` | Evaluation scoring provider (`openai`, `gemini`). |
| `EVALUATION_AUTO_ENABLED`| Config | `true` | Kill-switch for automated AI scoring. |

### Shared Environment Group: `saamyukt-storage-config`
| Key | Type | Default / Required | Description |
| :--- | :--- | :--- | :--- |
| `EVIDENCE_STORAGE_DIR` | Path | `/data/evidence` | Mount path for evidence files. |
| `PORTAL_FILE_STORAGE_DIR` | Path | `/data/portal-files`| Mount path for portal submission attachments. |
| `CODEJUDGE_ANALYZER_DIR` | Path | `/opt/codejudge-analyzer` | Path to Python static analysis tool in container. |
| `CODEJUDGE_WORKSPACES_DIR`| Path | `/data/codejudge-workspaces` | Mount path for git clone workspaces. |
| `CODEJUDGE_SANDBOX_ENABLED`| Boolean | `false` | Execution sandbox flag. |

### Gateway (`gateway`)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `8080` | Render-assigned HTTP port. |
| `CORS_ALLOWED_ORIGIN` | URL | `*` | Allowed origin for frontend SPA (e.g. `https://saamyukt.onrender.com`). |
