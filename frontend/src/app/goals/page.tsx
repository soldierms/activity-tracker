"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import GoalForm from "@/components/GoalForm";
import ProgressBar from "@/components/ProgressBar";
import { Goal, api } from "@/lib/api";

const PERIOD_LABEL: Record<Goal["period"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  long_term: "Long-term",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setGoals(await api.listGoals());
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await api.deleteGoal(id);
    refresh();
  }

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Goals</h1>
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Goal
          </button>
        </div>

        {loading && <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</p>}

        {!loading && goals.length === 0 && (
          <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">No goals yet.</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{goal.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {PERIOD_LABEL[goal.period]}
                    {goal.deadline ? ` · due ${goal.deadline}` : ""}
                    {goal.achieved_at
                      ? ` · achieved ${new Date(goal.achieved_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                    goal.status === "achieved"
                      ? "bg-emerald-50 text-emerald-600"
                      : goal.status === "missed"
                        ? "bg-red-50 text-red-600"
                        : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              <div className="mt-3">
                <ProgressBar percent={(goal.progress / goal.target) * 100} />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {goal.progress} / {goal.target}
                </p>
              </div>

              <div className="mt-3 flex gap-2 text-xs">
                <button
                  onClick={() => {
                    setEditing(goal);
                    setShowForm(true);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-indigo-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-slate-400 dark:text-slate-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <GoalForm
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
