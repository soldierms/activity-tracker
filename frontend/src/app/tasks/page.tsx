"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import TaskForm from "@/components/TaskForm";
import { Task, TaskStatus, api } from "@/lib/api";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To-do" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
];

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "text-red-600 bg-red-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setTasks(await api.listTasks());
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function cycleStatus(task: Task) {
    const next: Record<TaskStatus, TaskStatus> = {
      todo: "in_progress",
      in_progress: "completed",
      completed: "todo",
    };
    await api.updateTask(task.id, { status: next[task.status] });
    refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteTask(id);
    refresh();
  }

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tasks</h1>
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Task
          </button>
        </div>

        {loading && <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</p>}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.status} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                {col.label} ({tasks.filter((t) => t.status === col.status).length})
              </p>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === col.status)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-slate-100 dark:border-slate-700 p-3 text-sm hover:border-slate-300 dark:border-slate-600"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => cycleStatus(task)}
                          className="text-left font-medium text-slate-800 dark:text-slate-100 hover:text-indigo-600"
                          title="Click to advance status"
                        >
                          {task.title}
                        </button>
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_COLOR[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      {task.due_date && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Due {task.due_date}</p>
                      )}
                      <div className="mt-2 flex gap-2 text-xs">
                        <button
                          onClick={() => {
                            setEditing(task);
                            setShowForm(true);
                          }}
                          className="text-slate-400 dark:text-slate-500 hover:text-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-slate-400 dark:text-slate-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <TaskForm
            initial={editing}
            onCancel={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              refresh();
            }}
          />
        )}
      </main>
    </RequireAuth>
  );
}
