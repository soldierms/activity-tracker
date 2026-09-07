"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { Activity, api } from "@/lib/api";
import { monthGrid, toIso, todayIso } from "@/lib/date";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function intensityClass(hours: number): string {
  if (hours === 0) return "bg-white";
  if (hours < 1) return "bg-indigo-50";
  if (hours < 3) return "bg-indigo-100";
  if (hours < 5) return "bg-indigo-200";
  return "bg-indigo-300";
}

export default function CalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayIso();

  useEffect(() => {
    const start = toIso(days[0]);
    const end = toIso(days[days.length - 1]);
    setLoading(true);
    api
      .listActivitiesRange(start, end)
      .then(setActivities)
      .finally(() => setLoading(false));
  }, [days]);

  const byDate = useMemo(() => {
    const map = new Map<string, { hours: number; count: number }>();
    for (const a of activities) {
      const entry = map.get(a.date) ?? { hours: 0, count: 0 };
      entry.hours += a.duration_minutes / 60;
      entry.count += 1;
      map.set(a.date, entry);
    }
    return map;
  }, [activities]);

  function goToMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">{monthLabel}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setYear(now.getFullYear());
                setMonth(now.getMonth());
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              onClick={() => goToMonth(-1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              ← Prev
            </button>
            <button
              onClick={() => goToMonth(1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-slate-500">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((d) => {
              const iso = toIso(d);
              const inMonth = d.getMonth() === month;
              const info = byDate.get(iso);
              return (
                <button
                  key={iso}
                  onClick={() => router.push(`/daily-log?date=${iso}`)}
                  className={`flex h-20 flex-col items-start rounded-md border p-2 text-left transition ${
                    inMonth ? intensityClass(info?.hours ?? 0) : "bg-slate-50 text-slate-300"
                  } ${iso === today ? "border-indigo-500" : "border-slate-100"} hover:border-indigo-400`}
                >
                  <span className={`text-xs ${inMonth ? "text-slate-700" : "text-slate-300"}`}>
                    {d.getDate()}
                  </span>
                  {info && inMonth && (
                    <span className="mt-auto text-xs font-medium text-indigo-700">
                      {info.hours.toFixed(1)}h · {info.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <p className="mt-4 text-center text-sm text-slate-400">Loading...</p>}

        <p className="mt-4 text-xs text-slate-400">Click a day to view or add activities.</p>
      </main>
    </RequireAuth>
  );
}
