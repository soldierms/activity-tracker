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

(Frontend service can be added to `docker-compose.yml` the same way once you're ready to containerize it for deployment.)

## Roadmap

- Phase 2: calendar view, categories management, weekly/monthly reports
- Phase 3: AI daily summary, weekly AI review, natural-language activity entry (all done)
- Phase 4: Docker Compose → CI/CD → Terraform → AWS (ECS/RDS/S3/CloudFront)
- Phase 5: EKS, Helm, observability
