export default function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{clamped.toFixed(0)}%</p>
    </div>
  );
}
