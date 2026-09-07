# Activity Tracker

Personal activity, task, goal, and time tracker. Next.js frontend, FastAPI backend, PostgreSQL database.

## Phase 1 (current)

- Email/password signup & login (JWT)
- Dashboard: today's progress, hours logged, activity list
- Daily Log: browse/add/edit/delete activities by date
- Tasks: kanban-style to-do / in-progress / completed board
- Goals: daily/weekly/monthly/long-term goals with progress bars

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
- Phase 3: AI daily/weekly summaries, natural-language activity entry
- Phase 4: Docker Compose → CI/CD → Terraform → AWS (ECS/RDS/S3/CloudFront)
- Phase 5: EKS, Helm, observability
