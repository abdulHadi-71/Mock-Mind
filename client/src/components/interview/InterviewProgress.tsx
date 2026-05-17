'use client';

interface InterviewProgressProps {
  current: number;
  total: number;
}

export function InterviewProgress({ current, total }: InterviewProgressProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Progress</span>
        <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
          {current}/{total}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
