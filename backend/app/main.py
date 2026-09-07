from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import activities, auth, categories, dashboard, goals, reports, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Activity Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(activities.router)
app.include_router(tasks.router)
app.include_router(goals.router)
app.include_router(dashboard.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok"}
