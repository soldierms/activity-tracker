from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import activities, ai, auth, categories, dashboard, goals, reports, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Activity Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = [auth.router, categories.router, activities.router, tasks.router, goals.router, dashboard.router, reports.router, ai.router]

for router in routers:
    app.include_router(router)
    # Also served under /api/*: in production the frontend and backend sit
    # behind the same load balancer routed by path, and several backend
    # routes (e.g. GET /categories, /tasks, /goals) sit at the exact same
    # bare path as a frontend page of the same name. /api/* never collides
    # with a frontend route, so that's what the ALB forwards to the backend
    # (see terraform/alb.tf) and what NEXT_PUBLIC_API_URL points at in
    # production. Local dev keeps hitting the bare paths directly.
    app.include_router(router, prefix="/api")


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
