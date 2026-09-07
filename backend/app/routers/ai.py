from datetime import date as date_type

from anthropic import Anthropic
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import Activity, Category, Goal, GoalStatus, Task, TaskStatus, User
from app.routers.reports import weekly_report
from app.schemas import (
    AIDailySummaryResponse,
    AIParseActivityRequest,
    AIParseActivityResponse,
    AIWeeklyReviewResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])

DAILY_SYSTEM_PROMPT = (
    "You are a concise, encouraging productivity coach writing a short daily recap "
    "for a personal activity tracker app. Write 2-4 sentences, plain prose, no "
    "markdown, no bullet points, no headers. Mention concrete numbers when useful. "
    "If little or nothing was logged, say so briefly and encourage logging today's work."
)

WEEKLY_SYSTEM_PROMPT = (
    "You are a concise, encouraging productivity coach writing a short weekly review "
    "for a personal activity tracker app. Write 3-5 sentences, plain prose, no "
    "markdown, no bullet points, no headers. Summarize the week's numbers, call out "
    "the top category or two, and end with one specific, actionable recommendation "
    "for next week. If little or nothing was logged, say so briefly and encourage "
    "logging next week."
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


def generate_text(system: str, prompt: str, max_tokens: int = 300) -> str:
    client = Anthropic(api_key=settings.anthropic_api_key)
    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI request failed: {e}")

    return "".join(block.text for block in response.content if block.type == "text").strip()


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

    summary = generate_text(DAILY_SYSTEM_PROMPT, prompt)
    return AIDailySummaryResponse(summary=summary)


@router.post("/weekly-review", response_model=AIWeeklyReviewResponse)
def weekly_review(
    start: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_ai_configured()
    report = weekly_report(start=start, current_user=current_user, db=db)

    if report.hours_by_category:
        category_lines = "\n".join(
            f"- {c.category}: {c.hours}h" for c in report.hours_by_category
        )
    else:
        category_lines = "(none logged)"

    day_lines = "\n".join(f"- {d.date.isoformat()}: {d.hours}h" for d in report.hours_by_day)

    prompt = (
        f"Week: {report.start_date.isoformat()} to {report.end_date.isoformat()}\n"
        f"Total hours logged: {report.total_hours}\n"
        f"Activities logged: {report.activities_count}\n"
        f"Tasks completed this week: {report.tasks_completed}\n"
        f"Goals achieved this week: {report.goals_achieved}\n\n"
        f"Hours by day:\n{day_lines}\n\n"
        f"Hours by category:\n{category_lines}\n\n"
        "Write this week's review and one recommendation for next week."
    )

    review = generate_text(WEEKLY_SYSTEM_PROMPT, prompt, max_tokens=400)
    return AIWeeklyReviewResponse(review=review)


@router.post("/parse-activity", response_model=AIParseActivityResponse)
def parse_activity(
    payload: AIParseActivityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_ai_configured()

    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    category_names = [c.name for c in categories] or ["general"]
    default_category = "general" if "general" in category_names else category_names[0]

    client = Anthropic(api_key=settings.anthropic_api_key)
    tool = {
        "name": "extract_activity",
        "description": "Extract a structured activity log entry from a free-text description.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Short title for the activity, e.g. 'Terraform project'",
                },
                "category": {
                    "type": "string",
                    "enum": category_names,
                    "description": "Best-fitting category from the user's existing list",
                },
                "duration_minutes": {
                    "type": "number",
                    "description": "Duration in minutes. Convert hours to minutes. Default 30 if not mentioned.",
                },
                "status": {
                    "type": "string",
                    "enum": ["planned", "in_progress", "completed"],
                    "description": "completed if past tense / done, in_progress if ongoing, planned if future/intended",
                },
                "description": {
                    "type": "string",
                    "description": "Optional short note with any extra detail, or empty string",
                },
            },
            "required": ["title", "category", "duration_minutes", "status"],
        },
    }

    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=300,
            system=(
                "Extract a structured activity entry from what the user typed. "
                f"Available categories: {', '.join(category_names)}. "
                f"If nothing fits well, use '{default_category}'."
            ),
            tools=[tool],
            tool_choice={"type": "tool", "name": "extract_activity"},
            messages=[{"role": "user", "content": payload.text}],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI request failed: {e}")

    tool_use = next((b for b in response.content if b.type == "tool_use"), None)
    if not tool_use:
        raise HTTPException(status_code=502, detail="AI did not return structured data")

    data = tool_use.input
    return AIParseActivityResponse(
        title=data.get("title") or payload.text[:60],
        category=data.get("category") or default_category,
        duration_minutes=float(data.get("duration_minutes") or 30),
        status=data.get("status") or "completed",
        description=data.get("description") or None,
    )
