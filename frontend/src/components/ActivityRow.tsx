"use client";

import { Activity } from "@/lib/api";
import { dotClass } from "@/lib/colors";

const STATUS_ICON: Record<Activity["status"], string> = {
  completed: "✓",
  in_progress: "◐",
  planned: "○",
};

export default function ActivityRow({
  activity,
  categoryColor,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  categoryColor?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hours = (activity.duration_minutes / 60).toFixed(1);

  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className={`text-lg ${
            activity.status === "completed" ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {STATUS_ICON[activity.status]}
        </span>
        <div>
          <p className="text-sm font-medium text-slate-800">{activity.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`h-2 w-2 rounded-full ${dotClass(categoryColor ?? "slate")}`} />
            {activity.category} · {hours} hrs
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button onClick={onEdit} className="text-slate-400 hover:text-indigo-600">
          Edit
        </button>
        <button onClick={onDelete} className="text-slate-400 hover:text-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
