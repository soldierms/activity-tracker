"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import StatCard from "@/components/StatCard";
import { WeeklyReport, api } from "@/lib/api";
import { addDays, formatShort, formatWeekday, mondayOf, toIso } from "@/lib/date";

export default function ReportsPage() {
  const [weekStart, setWeekStart] = useState(() => toIso(mondayOf(new Date())));
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .weeklyReport(weekStart)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [weekStart]);

  function shiftWeek(deltaWeeks: number) {
    setWeekStart(toIso(addDays(new Date(`${weekStart}T00:00:00`), deltaWeeks * 7)));
  }

  const maxDayHours = Math.max(1, ...(report?.hours_by_day.map((d) => d.hours) ?? [1]));
  const maxCategoryHours = Math.max(1, ...(report?.hours_by_category.map((c) => c.hours) ?? [1]));
  const isCurrentWeek = weekStart === toIso(mondayOf(new Date()));

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weekly Report</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftWeek(-1)}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ← Prev week
            </button>
            {!isCurrentWeek && (
              <button
                onClick={() => setWeekStart(toIso(mondayOf(new Date())))}
                className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                This week
              </button>
            )}
            <button
              onClick={() => shiftWeek(1)}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Next week →
            </button>
          </div>
        </div>

        {report && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatShort(report.start_date)} – {formatShort(report.end_date)}
          </p>
        )}

        {loading && <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</p>}

        {report && !loading && (
          <>
            <div className="mt-4 flex gap-4">
              <StatCard label="Total Hours" value={`${report.total_hours} hrs`} />
              <StatCard label="Activities" value={`${report.activities_count}`} />
              <StatCard label="Tasks Completed" value={`${report.tasks_completed}`} />
              <StatCard label="Goals Achieved" value={`${report.goals_achieved}`} />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">Hours per day</p>
              <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
                {report.hours_by_day.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{d.hours > 0 ? d.hours : ""}</span>
                    <div
                      className="w-full max-w-10 rounded-t-md bg-indigo-500"
                      style={{
                        height: `${Math.max(4, (d.hours / maxDayHours) * 120)}px`,
                      }}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatWeekday(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">Activities by category</p>
              {report.hours_by_category.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">No activities logged this week.</p>
              )}
              <div className="space-y-3">
                {report.hours_by_category.map((c) => (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-slate-700 dark:text-slate-300">{c.category}</span>
                      <span className="text-slate-500 dark:text-slate-400">{c.hours} hrs</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(c.hours / maxCategoryHours) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </RequireAuth>
  );
}
