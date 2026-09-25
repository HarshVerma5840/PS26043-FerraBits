# SAAMYUKT Frontend Application

This is the official frontend application for the SAAMYUKT platform (formerly SIH26043 / FerraBits). It connects to the underlying Spring Boot microservices via the Caddy gateway.

## Technology Stack
- React 18
- TypeScript
- Vite
- React Router DOM
- TanStack Query (React Query)
- Axios
- Recharts
- React-Leaflet
- Lucide React (Icons)

## Project Structure
- `src/api`: Axios HTTP client and domain-specific API wrappers (auth, problem, portal, etc.)
- `src/auth`: JWT-based authentication context and hooks
- `src/components`: Reusable UI components (Sidebar, FileUploadPanel, etc.)
- `src/layouts`: Master page templates (PortalLayout, ProjectLayout, AdminLayout)
- `src/pages`: Distinct page views matching router targets
- `src/types`: Centralized TypeScript interfaces reflecting backend entities

## API Architecture
The frontend assumes a unified API gateway (Caddy) serving all microservices under specific path prefixes (`/auth`, `/problems`, `/portal`, `/capability`, etc.).
When running locally via Vite (`npm run dev`), Vite automatically proxies these prefixes to `http://localhost:8080`.

## Environment Variables
The application recognizes the following environment variables:
- `VITE_API_BASE_URL`: The absolute base URL for the API gateway. (Default: `/` which leverages same-origin relative paths in Docker, or falls back to Vite proxy during dev).

## Available Commands

### Development
```bash
# Install dependencies
npm install

# Start the Vite development server on http://localhost:5173
npm run dev
```

### Building & Checking
```bash
# Compile TypeScript without emitting files (typecheck)
npm run typecheck

# Lint the codebase
npm run lint

# Build the production application into /dist
npm run build
```

## Docker Operations
This frontend is built into the main Docker Compose stack as the `frontend` service.
It uses a multi-stage Dockerfile:
1. `node:20-alpine`: Compiles the React application.
2. `nginx:alpine`: Serves the static `/dist` directory.

The main `docker-compose.yml` mounts the Nginx container, and the root Caddy gateway routes all traffic not matching API endpoints directly to this frontend, supporting robust SPA push-state refreshing.

```bash
# Build and start the entire stack, including the frontend
docker-compose up --build -d
```

## Known Placeholders / Mocks
- Analytics heatmap default coordinates are placeholders. If `lat/lng` are absent from the backend `DistrictAnalytics` payload, they default to center-India.
- Certain chart visualizations will fall back to static mock data if the backend `/capability/api/v1/analytics/projects` returns an empty array, strictly to ensure visual structure during the backend rollout phase.
- Some file downloading workflows use mock blob generation if the backend binary stream is incomplete.
