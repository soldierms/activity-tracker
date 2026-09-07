from collections import defaultdict
from datetime import date as date_type, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Activity, Goal, Task, User
from app.schemas import CategoryHours, DayHours, WeeklyReport

router = APIRouter(prefix="/reports", tags=["reports"])


def week_start(d: date_type) -> date_type:
    return d - timedelta(days=d.weekday())


@router.get("/weekly", response_model=WeeklyReport)
def weekly_report(
    start: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    start_date = week_start(start or date_type.today())
    end_date = start_date + timedelta(days=6)

    activities = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id,
            Activity.date >= start_date,
            Activity.date <= end_date,
        )
        .all()
    )

    hours_by_day_map: dict[date_type, float] = {
        start_date + timedelta(days=i): 0.0 for i in range(7)
    }
    hours_by_category_map: dict[str, float] = defaultdict(float)

    for activity in activities:
        hours = activity.duration_minutes / 60
        hours_by_day_map[activity.date] = hours_by_day_map.get(activity.date, 0.0) + hours
        hours_by_category_map[activity.category] += hours

    tasks_completed = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.completed_at.isnot(None),
            Task.completed_at >= start_date,
            Task.completed_at < end_date + timedelta(days=1),
        )
        .count()
    )

    goals_achieved = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id,
            Goal.achieved_at.isnot(None),
            Goal.achieved_at >= start_date,
            Goal.achieved_at < end_date + timedelta(days=1),
        )
        .count()
    )

    return WeeklyReport(
        start_date=start_date,
        end_date=end_date,
        total_hours=round(sum(hours_by_day_map.values()), 2),
        activities_count=len(activities),
        tasks_completed=tasks_completed,
        goals_achieved=goals_achieved,
        hours_by_day=[
            DayHours(date=d, hours=round(h, 2)) for d, h in sorted(hours_by_day_map.items())
        ],
        hours_by_category=[
            CategoryHours(category=c, hours=round(h, 2))
            for c, h in sorted(hours_by_category_map.items(), key=lambda kv: -kv[1])
        ],
    )
