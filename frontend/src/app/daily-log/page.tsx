"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import ActivityForm from "@/components/ActivityForm";
import ActivityRow from "@/components/ActivityRow";
import { Activity, api } from "@/lib/api";
import { todayIso } from "@/lib/date";
import { useCategoryColors } from "@/lib/useCategoryColors";

function DailyLogContent() {
  const searchParams = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") ?? todayIso());
  const [activities, setActivities] = useState<Activity[]>([]);
  const categoryColors = useCategoryColors();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Activity | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await api.listActivities(date);
    setActivities(data);
  }

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [date]);

  async function handleDelete(id: string) {
    await api.deleteActivity(id);
    refresh();
  }

  const totalHours = activities.reduce((sum, a) => sum + a.duration_minutes, 0) / 60;

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Daily Log</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {activities.length} activities · {totalHours.toFixed(1)} hrs logged
            </p>
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

          {loading && <p className="py-6 text-center text-sm text-slate-400">Loading...</p>}

          {!loading && activities.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              No activities logged for this date.
            </p>
          )}

          {activities.map((activity) => (
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
            date={date}
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

export default function DailyLogPage() {
  return (
    <Suspense>
      <DailyLogContent />
    </Suspense>
  );
}
