"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import ActivityForm from "@/components/ActivityForm";
import ActivityRow from "@/components/ActivityRow";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import { Activity, DashboardSummary, api } from "@/lib/api";
import { useCategoryColors } from "@/lib/useCategoryColors";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Activity | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const categoryColors = useCategoryColors();

  const today = todayIso();

  async function refresh() {
    const data = await api.dashboard(today);
    setSummary(data);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const completedCount = summary?.activities.filter((a) => a.status === "completed").length ?? 0;
  const totalCount = summary?.activities.length ?? 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  async function handleDelete(id: string) {
    await api.deleteActivity(id);
    refresh();
  }

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="text-lg font-medium text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h1>

        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Today&apos;s Progress</p>
          <ProgressBar percent={progressPercent} />

          <div className="mt-6 flex gap-4">
            <StatCard label="Activities" value={`${completedCount} / ${totalCount}`} />
            <StatCard label="Hours" value={`${summary?.hours_logged ?? 0} hrs`} />
            <StatCard
              label="Tasks"
              value={`${summary?.tasks_completed ?? 0} / ${summary?.tasks_total ?? 0}`}
            />
            <StatCard
              label="Goals"
              value={`${summary?.goals_achieved ?? 0} / ${summary?.goals_total ?? 0}`}
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Today&apos;s Activities</p>
            <button
              onClick={() => {
                setEditing(undefined);
                setShowForm(true);
              }}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Activity
            </button>
          </div>

          {loading && <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</p>}

          {!loading && totalCount === 0 && (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Nothing logged yet today. Add your first activity.
            </p>
          )}

          {summary?.activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              categoryColor={categoryColors[activity.category]}
              onEdit={() => {
                setEditing(activity);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(activity.id)}
            />
          ))}
        </div>

        {showForm && (
          <ActivityForm
            date={today}
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
