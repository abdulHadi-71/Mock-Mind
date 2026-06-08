'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  TrendingUp,
  Award,
  Target,
  Clock,
  ChevronRight,
  Sparkles,
  Flame,
  Trophy,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import { useAuth } from '@/context/AuthContext';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-teal-500';
  if (score >= 60) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-500';
}

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-brand-600">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
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

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    in_progress: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    draft: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500' },
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-purple-700 p-8 text-white shadow-2xl shadow-brand-600/20">
        {/* Decorative Elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />
        <div className="absolute right-20 bottom-4 h-20 w-20 rounded-full bg-white/5 animate-float" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-brand-200">{getGreeting()}</p>
            <h1 className="mt-1 text-3xl font-bold">{user?.name || 'Candidate'} 👋</h1>
            <p className="mt-2 max-w-md text-sm text-brand-100/80">
              Track your interview performance, review past sessions, and keep improving with AI-powered mock interviews.
            </p>
          </div>
          <Link href="/interview/start" prefetch={false}>
            <Button className="!bg-white !text-brand-700 hover:!bg-brand-50 !shadow-lg !shadow-white/20 !rounded-xl !px-6 !py-3 !text-sm !font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your dashboard…</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Trophy}
              label="Completed"
              value={String(performance?.completedInterviews ?? 0)}
              gradient="from-amber-500 to-orange-500"
              bgGlow="bg-amber-500/10"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Score"
              value={`${performance?.averageScore ?? 0}%`}
              gradient="from-brand-500 to-indigo-500"
              bgGlow="bg-brand-500/10"
            />
            <StatCard
              icon={Target}
              label="Total Sessions"
              value={String(history.length)}
              gradient="from-emerald-500 to-teal-500"
              bgGlow="bg-emerald-500/10"
            />
            <StatCard
              icon={Flame}
              label="Latest Score"
              value={
                performance?.recentScores?.[0]
                  ? `${performance.recentScores[0].overallScore}%`
                  : '—'
              }
              gradient="from-purple-500 to-pink-500"
              bgGlow="bg-purple-500/10"
            />
          </div>

          {/* Chart Section */}
          {chartData.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Score Progress</h2>
                    <p className="text-xs text-slate-500">Your performance over time</p>
                  </div>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#scoreGradient)"
                      dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Interview History */}
          <section id="history" className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interview History</h2>
                  <p className="text-xs text-slate-500">{history.length} total sessions</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-500/10">
                    <Sparkles className="h-8 w-8 text-brand-500" />
                  </div>
                  <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">No interviews yet</p>
                  <p className="mt-1 text-sm text-slate-500">Start your first mock interview to see results here</p>
                  <Link href="/interview/start" prefetch={false} className="mt-5">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Start First Interview
                    </Button>
                  </Link>
                </div>
              ) : (
                history.map((iv) => {
                  const status = String(iv.status);
                  const config = statusConfig[status] ?? statusConfig.draft;
                  const score = iv.finalScore != null ? Number(iv.finalScore) : null;
                  return (
                    <Link
                      key={String(iv._id)}
                      href={
                        status === 'completed'
                          ? `/results/${iv._id}`
                          : `/interview/session/${iv._id}`
                      }
                      prefetch={false}
                      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${score != null ? `bg-gradient-to-br ${getScoreGradient(score)}` : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {score != null ? (
                            <span className="text-sm font-bold text-white">{score}</span>
                          ) : (
                            <Award className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {String(iv.title)}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            <span className="capitalize">{String(iv.role)}</span>
                            {' · '}
                            <span className="capitalize">{String(iv.difficulty)}</span>
                            {' · '}
                            {new Date(String(iv.createdAt)).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {score != null && (
                          <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        )}
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.text}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                    </Link>
                  );
                })
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
  gradient,
  bgGlow,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  gradient: string;
  bgGlow: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-950/50">
      {/* Glow effect on hover */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
