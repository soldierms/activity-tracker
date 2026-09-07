# Activity Tracker

Personal activity, task, goal, and time tracker. Next.js frontend, FastAPI backend, PostgreSQL database.

## Phase 1 (current)

- Email/password signup & login (JWT)
- Dashboard: today's progress, hours logged, activity list
- Daily Log: browse/add/edit/delete activities by date
- Tasks: kanban-style to-do / in-progress / completed board
- Goals: daily/weekly/monthly/long-term goals with progress bars
- Calendar view, category management, weekly reports
- Settings: account (name/email/password), light/dark/system theme
- AI Daily Summary ("Analyze My Day" on the dashboard) via Claude
- AI Weekly Review (Reports page) via Claude
- Natural-language activity entry ("Quick add" in the Add Activity form) via Claude

## AI features

The dashboard's "Analyze My Day" button, the Reports page's "Generate Review"
button, and the Add Activity form's "Quick add" field all call Anthropic's
Claude API. To enable them, add your API key to `backend/.env` (create the
file if it doesn't exist):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Restart the backend after adding it. Without a key, each of these shows a
clear "not configured" message instead of failing silently — no other
features are affected.

## Running locally

1. Start Postgres:

   ```bash
   docker compose up -d postgres
   ```

2. Backend:

   ```bash
   cd backend
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:3000, sign up, and start logging.

## Everything via Docker

```bash
docker compose up --build
```

Runs Postgres, the backend (`:8000`), and the frontend (`:3000`) together —
the same three containers that would run in production. Set
`ANTHROPIC_API_KEY` in your shell before running this if you want AI features
inside the containers too.

## CI/CD

- `.github/workflows/ci.yml` — runs on every push/PR: frontend typecheck +
  lint + build, backend import/health check against a real Postgres service
  container. No AWS access needed.
- `.github/workflows/deploy.yml` — runs on push to `main`: builds and pushes
  both Docker images to ECR, then forces a new ECS deployment. Needs the AWS
  infra to already exist (see `terraform/README.md`) and one repo secret,
  `AWS_DEPLOY_ROLE_ARN`, set to the `github_actions_role_arn` Terraform
  output. Authenticates via GitHub's OIDC provider — no long-lived AWS keys
  stored in GitHub.

## AWS deployment (Terraform)

See [`terraform/README.md`](terraform/README.md) for the architecture,
cost estimate, and deliberate simplifications (no NAT gateway, no domain/
HTTPS yet, single-AZ RDS). `terraform apply` provisions real, billable AWS
resources — nothing in this repo does that automatically.

## Roadmap

- Phase 2: calendar view, categories management, weekly/monthly reports (done)
- Phase 3: AI daily summary, weekly AI review, natural-language activity entry (done)
- Phase 4: Docker Compose (done) → CI/CD (done) → Terraform (done, not yet applied) → AWS
- Phase 5: EKS, Helm, observability
