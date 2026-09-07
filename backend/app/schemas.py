from datetime import datetime, date as date_type
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import ActivityStatus, TaskStatus, TaskPriority, GoalPeriod, GoalStatus


# ---- Auth ----

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: EmailStr


# ---- Activities ----

class ActivityCreate(BaseModel):
    title: str
    description: str | None = None
    category: str = "general"
    date: date_type
    start_time: datetime | None = None
    end_time: datetime | None = None
    duration_minutes: float = 0
    status: ActivityStatus = ActivityStatus.completed


class ActivityUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    date: date_type | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    duration_minutes: float | None = None
    status: ActivityStatus | None = None


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str | None
    category: str
    date: date_type
    start_time: datetime | None
    end_time: datetime | None
    duration_minutes: float
    status: ActivityStatus


# ---- Tasks ----

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: TaskPriority = TaskPriority.medium
    status: TaskStatus = TaskStatus.todo
    due_date: date_type | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: date_type | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str | None
    priority: TaskPriority
    status: TaskStatus
    due_date: date_type | None
    completed_at: datetime | None


# ---- Goals ----

class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    period: GoalPeriod = GoalPeriod.daily
    target: float = 1
    progress: float = 0
    deadline: date_type | None = None
    status: GoalStatus = GoalStatus.active


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    period: GoalPeriod | None = None
    target: float | None = None
    progress: float | None = None
    deadline: date_type | None = None
    status: GoalStatus | None = None


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str | None
    period: GoalPeriod
    target: float
    progress: float
    deadline: date_type | None
    status: GoalStatus
    achieved_at: datetime | None


# ---- AI ----

class AIDailySummaryResponse(BaseModel):
    summary: str


# ---- Categories ----

class CategoryCreate(BaseModel):
    name: str
    color: str = "slate"


class CategoryUpdate(BaseModel):
    name: str | None = None
    color: str | None = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    color: str


# ---- Reports ----

class DayHours(BaseModel):
    date: date_type
    hours: float


class CategoryHours(BaseModel):
    category: str
    hours: float


class WeeklyReport(BaseModel):
    start_date: date_type
    end_date: date_type
    total_hours: float
    activities_count: int
    tasks_completed: int
    goals_achieved: int
    hours_by_day: list[DayHours]
    hours_by_category: list[CategoryHours]


# ---- Dashboard ----

class DashboardSummary(BaseModel):
    date: date_type
    tasks_completed: int
    tasks_total: int
    hours_logged: float
    goals_achieved: int
    goals_total: int
    activities: list[ActivityOut]
