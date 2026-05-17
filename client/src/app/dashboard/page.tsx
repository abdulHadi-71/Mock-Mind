'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Award, Target } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { getInterviewHistory } from '@/lib/interview';
import type { ApiResponse, PerformanceHistory } from '@/types';

export default function DashboardPage() {
  const [performance, setPerformance] = useState<PerformanceHistory | null>(null);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [perfRes, histRes] = await Promise.all([
          api.get<ApiResponse<PerformanceHistory>>('/users/performance'),
          getInterviewHistory(1),
        ]);
        setPerformance(perfRes.data);
        setHistory(histRes.data.interviews);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData =
    performance?.recentScores
      ?.slice()
      .reverse()
      .map((s, i) => ({
        name: `Session ${i + 1}`,
        score: s.overallScore,
      })) ?? [];

  const statusColors: Record<string, string> = {
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    draft: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500">Your interview performance at a glance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" prefetch={false}>
            <Button variant="secondary">Home</Button>
          </Link>
          <Link href="/interview/start" prefetch={false}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-20 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Award} label="Completed" value={String(performance?.completedInterviews ?? 0)} />
            <StatCard icon={TrendingUp} label="Avg Score" value={`${performance?.averageScore ?? 0}%`} />
            <StatCard icon={Target} label="Sessions" value={String(history.length)} />
            <StatCard
              icon={TrendingUp}
              label="Latest Score"
              value={
                performance?.recentScores?.[0]
                  ? `${performance.recentScores[0].overallScore}%`
                  : '—'
              }
            />
          </div>

          {chartData.length > 0 && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Score Progress</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <section id="history" className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Interview History</h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-slate-500">No interviews yet.</p>
              ) : (
                history.map((iv) => (
                  <Link
                    key={String(iv._id)}
                    href={
                      iv.status === 'completed'
                        ? `/results/${iv._id}`
                        : `/interview/session/${iv._id}`
                    }
                    prefetch={false}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{String(iv.title)}</h3>
                      <p className="text-sm capitalize text-slate-500">
                        {String(iv.role)} · {String(iv.difficulty)} ·{' '}
                        {new Date(String(iv.createdAt)).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {iv.finalScore != null && (
                        <span className="text-lg font-bold text-indigo-600">{String(iv.finalScore)}%</span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          statusColors[String(iv.status)] ?? statusColors.draft
                        }`}
                      >
                        {String(iv.status).replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
