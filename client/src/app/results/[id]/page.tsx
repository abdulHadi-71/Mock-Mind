'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Mail, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { getInterviewResult, downloadPdfReport, emailReport } from '@/lib/interview';

interface ResultData {
  interview: Record<string, unknown>;
  feedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
    sections: Array<{ title: string; content: string; rating?: number }>;
    fullAiReport?: Record<string, unknown>;
  };
  score: { overallScore: number; maxOverallScore: number; categories: Array<{ name: string; score: number; maxScore: number; notes?: string }> } | null;
  questions: Array<{ text: string; order: number }>;
  answers: Array<{ content: string; score?: number }>;
}

export default function ResultsPage() {
  return (
    <DashboardLayout>
      <ResultsContent />
    </DashboardLayout>
  );
}

function ResultsContent() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    getInterviewResult(id)
      .then((res) => setData(res.data as unknown as ResultData))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownload() {
    const blob = await downloadPdfReport(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aimi-report-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleEmail() {
    setEmailing(true);
    try {
      await emailReport(id);
      alert('Report sent to your email');
    } catch {
      alert('Email not configured or failed');
    } finally {
      setEmailing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) return <p className="p-8">Results not found</p>;

  const { interview, feedback, score } = data;

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <Link href="/dashboard" prefetch={false} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{String(interview.title)}</h1>
          <p className="capitalize text-slate-500">
            {String(interview.role)} · {String(interview.difficulty)} · {String(interview.type)}
          </p>
        </div>
        {score && (
          <div className="rounded-xl bg-indigo-600 px-8 py-4 text-center text-white">
            <p className="text-4xl font-bold">{score.overallScore}</p>
            <p className="text-sm opacity-80">/ {score.maxOverallScore}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="secondary" onClick={handleEmail} isLoading={emailing}>
          <Mail className="mr-2 h-4 w-4" />
          Email Report
        </Button>
        <Link href="/interview/start" prefetch={false}>
          <Button>Practice Again</Button>
        </Link>
      </div>

      <p className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {feedback.summary}
      </p>

      {score?.categories && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Score Breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {score.categories.map((cat) => (
              <div key={cat.name} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex justify-between">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-indigo-600 font-semibold">
                    {cat.score}/{cat.maxScore}
                  </span>
                </div>
                {cat.notes && <p className="mt-2 text-sm text-slate-500">{cat.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
          <h3 className="font-semibold text-green-800 dark:text-green-300">Strengths</h3>
          <ul className="mt-3 space-y-1 text-sm">
            {feedback.strengths.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300">Improvements</h3>
          <ul className="mt-3 space-y-1 text-sm">
            {feedback.improvements.map((i) => (
              <li key={i}>• {i}</li>
            ))}
          </ul>
        </div>
      </div>

      {feedback.sections?.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Detailed Analysis</h2>
          {feedback.sections.map((s) => (
            <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between">
                <h3 className="font-medium">{s.title}</h3>
                {s.rating != null && <span className="text-indigo-600">{s.rating}/10</span>}
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.content}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
