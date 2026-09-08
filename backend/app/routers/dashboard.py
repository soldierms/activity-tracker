from datetime import date as date_type

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Activity, Goal, GoalStatus, Task, TaskStatus, User
from app.schemas import DashboardSummary

# Not "/dashboard" — the frontend has a page at that exact path, and in
# production both are reached through the same ALB, routed by path.
router = APIRouter(prefix="/dashboard-summary", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard(
    date: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_date = date or date_type.today()

    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id, Activity.date == target_date)
        .order_by(Activity.created_at.asc())
        .all()
    )

    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    tasks_completed = sum(1 for t in tasks if t.status == TaskStatus.completed)

    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    goals_achieved = sum(1 for g in goals if g.status == GoalStatus.achieved)

    hours_logged = sum(a.duration_minutes for a in activities) / 60

    return DashboardSummary(
        date=target_date,
        tasks_completed=tasks_completed,
        tasks_total=len(tasks),
        hours_logged=round(hours_logged, 2),
        goals_achieved=goals_achieved,
        goals_total=len(goals),
        activities=activities,
    )
