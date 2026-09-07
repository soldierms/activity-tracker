const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ActivityStatus = "planned" | "in_progress" | "completed";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type GoalPeriod = "daily" | "weekly" | "monthly" | "long_term";
export type GoalStatus = "active" | "achieved" | "missed";

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  category: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  status: ActivityStatus;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ParsedActivity {
  title: string;
  category: string;
  duration_minutes: number;
  status: ActivityStatus;
  description: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  period: GoalPeriod;
  target: number;
  progress: number;
  deadline: string | null;
  status: GoalStatus;
  achieved_at: string | null;
}

export interface DashboardSummary {
  date: string;
  tasks_completed: number;
  tasks_total: number;
  hours_logged: number;
  goals_achieved: number;
  goals_total: number;
  activities: Activity[];
}

export interface DayHours {
  date: string;
  hours: number;
}

export interface CategoryHours {
  category: string;
  hours: number;
}

export interface WeeklyReport {
  start_date: string;
  end_date: string;
  total_hours: number;
  activities_count: number;
  tasks_completed: number;
  goals_achieved: number;
  hours_by_day: DayHours[];
  hours_by_category: CategoryHours[];
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<{ access_token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: string; name: string; email: string }>("/auth/me"),
  updateProfile: (name: string, email: string) =>
    request<{ id: string; name: string; email: string }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ name, email }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  dashboard: (date?: string) =>
    request<DashboardSummary>(`/dashboard${date ? `?date=${date}` : ""}`),

  listActivities: (date?: string) =>
    request<Activity[]>(`/activities${date ? `?date=${date}` : ""}`),
  listActivitiesRange: (start: string, end: string) =>
    request<Activity[]>(`/activities?start=${start}&end=${end}`),
  createActivity: (data: Partial<Activity>) =>
    request<Activity>("/activities", { method: "POST", body: JSON.stringify(data) }),
  updateActivity: (id: string, data: Partial<Activity>) =>
    request<Activity>(`/activities/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteActivity: (id: string) =>
    request<void>(`/activities/${id}`, { method: "DELETE" }),

  listTasks: () => request<Task[]>("/tasks"),
  createTask: (data: Partial<Task>) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),

  listGoals: () => request<Goal[]>("/goals"),
  createGoal: (data: Partial<Goal>) =>
    request<Goal>("/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: Partial<Goal>) =>
    request<Goal>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request<void>(`/goals/${id}`, { method: "DELETE" }),

  weeklyReport: (start?: string) =>
    request<WeeklyReport>(`/reports/weekly${start ? `?start=${start}` : ""}`),

  listCategories: () => request<Category[]>("/categories"),
  createCategory: (data: { name: string; color: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<{ name: string; color: string }>) =>
    request<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<void>(`/categories/${id}`, { method: "DELETE" }),

  dailySummary: (date?: string) =>
    request<{ summary: string }>(`/ai/daily-summary${date ? `?date=${date}` : ""}`, {
      method: "POST",
    }),
  weeklyReview: (start?: string) =>
    request<{ review: string }>(`/ai/weekly-review${start ? `?start=${start}` : ""}`, {
      method: "POST",
    }),
  parseActivity: (text: string) =>
    request<ParsedActivity>("/ai/parse-activity", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};

export { ApiError };
