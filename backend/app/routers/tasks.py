from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Task, TaskStatus, User
from app.schemas import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def list_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        .all()
    )


@router.post("", response_model=TaskOut, status_code=201)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = Task(**payload.model_dump(), user_id=current_user.id)
    if task.status == TaskStatus.completed:
        task.completed_at = datetime.utcnow()
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates:
        new_status = updates["status"]
        if new_status == TaskStatus.completed and task.status != TaskStatus.completed:
            task.completed_at = datetime.utcnow()
        elif new_status != TaskStatus.completed and task.status == TaskStatus.completed:
            task.completed_at = None

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
