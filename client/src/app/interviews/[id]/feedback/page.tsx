'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface FeedbackData {
  feedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
    sections: Array<{ title: string; content: string; rating?: number }>;
    generatedAt: string;
  };
  score: {
    overallScore: number;
    maxOverallScore: number;
    categories: Array<{ name: string; score: number; maxScore: number; notes?: string }>;
  } | null;
}

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <FeedbackContent />
    </ProtectedRoute>
  );
}

function FeedbackContent() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ success: boolean; data: FeedbackData }>(`/interviews/${id}/feedback`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load feedback'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard" prefetch={false} className="mt-4 inline-block">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { feedback, score } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Interview Feedback</h1>
        {score && (
          <div className="rounded-xl bg-brand-600 px-6 py-3 text-center text-white">
            <p className="text-3xl font-bold">{score.overallScore}</p>
            <p className="text-xs opacity-80">/ {score.maxOverallScore}</p>
          </div>
        )}
      </div>

      <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
        {feedback.summary}
      </p>

      {score?.categories && score.categories.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Category Scores</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {score.categories.map((cat) => (
              <div key={cat.name} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900">{cat.name}</span>
                  <span className="text-brand-600 font-semibold">
                    {cat.score}/{cat.maxScore}
                  </span>
                </div>
                {cat.notes && <p className="mt-2 text-sm text-slate-600">{cat.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="font-semibold text-green-800">Strengths</h3>
          <ul className="mt-3 space-y-2 text-sm text-green-900">
            {feedback.strengths.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-800">Areas to Improve</h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {feedback.improvements.map((i) => (
              <li key={i}>• {i}</li>
            ))}
          </ul>
        </div>
      </div>

      {feedback.sections.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Detailed Sections</h2>
          {feedback.sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">{section.title}</h3>
                {section.rating != null && (
                  <span className="text-sm text-brand-600">{section.rating}/10</span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">{section.content}</p>
            </div>
          ))}
        </section>
      )}

      <div className="mt-10 flex justify-center gap-4">
        <Link href="/dashboard" prefetch={false}>
          <Button variant="secondary">Dashboard</Button>
        </Link>
        <Link href="/interviews/new">
          <Button>Practice Again</Button>
        </Link>
      </div>
    </div>
  );
}
