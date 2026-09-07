from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Activity, User
from app.schemas import ActivityCreate, ActivityOut, ActivityUpdate

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=list[ActivityOut])
def list_activities(
    date: date_type | None = None,
    start: date_type | None = None,
    end: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Activity).filter(Activity.user_id == current_user.id)
    if date:
        query = query.filter(Activity.date == date)
    if start:
        query = query.filter(Activity.date >= start)
    if end:
        query = query.filter(Activity.date <= end)
    return query.order_by(Activity.date.desc(), Activity.created_at.desc()).all()


@router.post("", response_model=ActivityOut, status_code=201)
def create_activity(
    payload: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = Activity(**payload.model_dump(), user_id=current_user.id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: str,
    payload: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.get(Activity, activity_id)
    if not activity or activity.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Activity not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.get(Activity, activity_id)
    if not activity or activity.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()
