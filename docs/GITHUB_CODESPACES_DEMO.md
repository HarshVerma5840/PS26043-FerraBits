# GitHub Codespaces demo deployment

This profile runs the backend stack in a GitHub Codespace and keeps the React
frontend on Vercel. It is intended for a short hackathon demonstration, not
production hosting.

## Create the Codespace

1. Push `.devcontainer/devcontainer.json` and `docker-compose.codespaces.yml`.
2. On GitHub, open the repository and choose **Code → Codespaces → Create codespace on main**.
3. Wait for the Codespace to finish creating. Nothing starts automatically.

## Configure the backend

Create a root `.env` file in the Codespace. Do not commit it. At minimum set:

```dotenv
DB_USERNAME=sih
DB_PASSWORD=replace-with-a-demo-password
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
IDENTITY_PEPPER=replace-with-a-random-pepper-at-least-16-characters
OPENAI_API_KEY=
GEMINI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
EVALUATION_AUTO_ENABLED=false
CORS_ALLOWED_ORIGIN=https://your-vercel-domain.example
```

For a demo without AI credentials, leave the AI keys empty and keep the
deterministic/fallback behavior enabled by the services.

## Start only when ready

From the repository root:

```bash
docker compose -f docker-compose.yml -f docker-compose.codespaces.yml up -d --build db eureka-server source-service problem-service evaluation-service portal-service codejudge-service capability-matching-service gateway
```

The public API entrypoint is the forwarded port `8080`. Make that port
**Public** in the Codespaces Ports panel, then copy its HTTPS URL.

Set the Vercel production variable:

```text
VITE_API_BASE_URL=https://<public-codespace-gateway-url>
```

Redeploy the Vercel frontend after changing that variable. Set
`CORS_ALLOWED_ORIGIN` in the Codespace `.env` to the exact Vercel origin and
restart the gateway if it was already running.

## Stop and clean up

```bash
docker compose -f docker-compose.yml -f docker-compose.codespaces.yml down
```

Codespace storage is temporary. Treat uploaded evidence, portal files, and
CodeJudge workspaces as disposable demo data.
