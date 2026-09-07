from datetime import date as date_type

from anthropic import Anthropic
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import Activity, Goal, GoalStatus, Task, TaskStatus, User
from app.schemas import AIDailySummaryResponse

router = APIRouter(prefix="/ai", tags=["ai"])

SYSTEM_PROMPT = (
    "You are a concise, encouraging productivity coach writing a short daily recap "
    "for a personal activity tracker app. Write 2-4 sentences, plain prose, no "
    "markdown, no bullet points, no headers. Mention concrete numbers when useful. "
    "If little or nothing was logged, say so briefly and encourage logging today's work."
)


def require_ai_configured():
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI features aren't configured yet. Set ANTHROPIC_API_KEY in the "
                "backend environment (backend/.env) to enable this."
            ),
        )


@router.post("/daily-summary", response_model=AIDailySummaryResponse)
def daily_summary(
    date: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_ai_configured()
    target_date = date or date_type.today()

    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id, Activity.date == target_date)
        .all()
    )
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    tasks_completed = sum(1 for t in tasks if t.status == TaskStatus.completed)
    goals_achieved = sum(1 for g in goals if g.status == GoalStatus.achieved)
    total_hours = sum(a.duration_minutes for a in activities) / 60

    if activities:
        activity_lines = "\n".join(
            f"- {a.title} ({a.category}, {a.duration_minutes / 60:.1f}h, {a.status.value})"
            for a in activities
        )
    else:
        activity_lines = "(none logged)"

    prompt = (
        f"Date: {target_date.isoformat()}\n"
        f"Activities logged today:\n{activity_lines}\n\n"
        f"Total hours logged today: {total_hours:.1f}\n"
        f"Tasks completed (all-time, out of {len(tasks)} total): {tasks_completed}\n"
        f"Goals achieved (all-time, out of {len(goals)} total): {goals_achieved}\n\n"
        "Write today's recap."
    )

    client = Anthropic(api_key=settings.anthropic_api_key)
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI request failed: {e}")

    summary = "".join(block.text for block in response.content if block.type == "text").strip()
    return AIDailySummaryResponse(summary=summary)
