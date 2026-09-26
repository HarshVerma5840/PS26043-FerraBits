# SAAMYUKT Web Frontend

## Overview
The SAAMYUKT web frontend provides administrative, governance, and evaluation workflows for the platform. It is built with React, TypeScript, Vite, and Tailwind CSS.

> **Note on Mobile App Workflows**
> Citizen and student/innovator workflows (e.g., submitting civic grievances, tracking project work) belong exclusively to the Android application. The web frontend does not contain pages for these roles.

## Environments & Startup

### Local Development
To run the frontend against a local backend (e.g., Caddy API Gateway):
```bash
npm install
npm run dev
```

### Production Build
To create a production-optimized static bundle:
```bash
npm run typecheck
npm run lint
npm run build
```
The output will be placed in the `dist/` directory.

### Docker Startup (Full Stack)
The frontend is designed to run behind a Caddy API Gateway within the microservice Docker stack.
To start the entire environment from the repository root:
```bash
# Package backend microservices (if not already packaged)
./mvnw -DskipTests package

# Bring up the full stack (Gateway, 6 Microservices, Postgres, Frontend Nginx)
docker compose up -d --build
```
The frontend is then accessible at `http://localhost:8080`.

## Configuration
The frontend relies on the following environment variable:
- `VITE_API_BASE_URL`: The URL of the API Gateway (default: `http://localhost:8080`).

### Backend Environment Variables (AI Models)
The AI models are used for **CodeJudge code evaluation**, **Domain Resolution**, and **AI Assessment** workflows.
Ensure the following are set in the environment where the backend is run:
- `GEMINI_API_KEY`: Required for Gemini-based evaluation and domain resolution.
- `OPENAI_API_KEY`: Required if using OpenAI-compatible endpoints (DeepSeek, etc).
- `AI_SCORING_PROVIDER`: Set to either `gemini` or `openai-compatible` (defaults to `openai-compatible`).

## Architecture & API Gateway
The frontend does not communicate directly with the individual microservices. All requests are routed through the Caddy API Gateway running on port `8080`.

- **API Proxy Route**: `/auth/api/v1/...`, `/problem/...`, etc., are proxied to their respective backend services by Caddy.
- **SPA Fallback**: Nested frontend routes (e.g., `/admin/governance`) are handled seamlessly on browser refresh via Nginx `try_files` logic.

## Roles & Routing

### Supported Roles
The web frontend exclusively supports the following JWT roles:
- `ADMIN`: Platform administrators and governance officials.
- `REVIEWER` / `NODAL_OFFICER`: Triage and scoping officials for civic grievances.
- `EVALUATOR`: Technical reviewers for innovator projects.
- `FACULTY`: Faculty members (Preview mode only).

### Role-to-Route Mapping
- `ADMIN` → `/admin/governance`, `/admin/analytics`
- `REVIEWER` → `/nodal/triage`
- `EVALUATOR` → `/evaluator/dashboard`
- `FACULTY` → `/faculty/projects`

### Faculty Preview Policy
Access to the Faculty Workspace (`/faculty/projects`) is strictly limited to users with the explicit `FACULTY` or `ADMIN` role. Regular `SUBMITTER` users are restricted and will receive an "Access Denied" (403) page. No arbitrary roles were created for this workflow.

## Testing

### Automated Tests
Run the Vitest and React Testing Library suite:
```bash
npm run test
```

### Browser Smoke-Test Checklist
To verify a deployment, ensure the following workflows succeed:
- [ ] **Admin Role**: Login → Redirects to Dashboard → Can access Governance and Analytics → Refresh page works.
- [ ] **Reviewer Role**: Login → Redirects to Triage Queue → Navigating to `/faculty/projects` denies access.
- [ ] **Evaluator Role**: Login → Redirects to Evaluator Dashboard.
- [ ] **Logout**: Successfully clears token and returns to login.
- [ ] **SPA Fallback**: Refreshing the browser on a deeply nested route does not throw a 404.

*Note: For testing, users can be manually elevated in the database (e.g., `UPDATE users SET role = 'ADMIN' WHERE phone = '9999999999';`).*

## Troubleshooting

- **502 Bad Gateway on API calls**: The backend microservice has not fully started up yet, or Eureka discovery is still propagating. Wait 30 seconds and try again.
- **401 Unauthorized**: JWT token has expired or is invalid. The frontend should automatically log you out.
- **404 on Browser Refresh**: Ensure Nginx is configured with `try_files $uri $uri/ /index.html` (handled automatically by the Dockerfile).
- **Network Error / CORS**: Ensure `VITE_API_BASE_URL` matches the exact hostname/port you are accessing in the browser.
