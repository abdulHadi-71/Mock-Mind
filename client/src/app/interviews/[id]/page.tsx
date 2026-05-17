'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { ApiResponse, Interview, Question, Answer } from '@/types';

interface SessionData {
  interview: Interview;
  questions: Question[];
  answers: Answer[];
}

export default function InterviewSessionPage() {
  return (
    <ProtectedRoute>
      <InterviewSession />
    </ProtectedRoute>
  );
}

function InterviewSession() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSession();
  }, [id]);

  async function loadSession() {
    try {
      const res = await api.get<ApiResponse<SessionData>>(`/interviews/${id}`);
      setSession(res.data);
      if (res.data.interview.status === 'draft') {
        await api.post(`/interviews/${id}/start`);
        const updated = await api.get<ApiResponse<SessionData>>(`/interviews/${id}`);
        setSession(updated.data);
      }
      const answered = res.data.answers.length;
      setCurrentIndex(Math.min(answered, res.data.questions.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview');
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!session || !answer.trim()) return;
    const question = session.questions[currentIndex];
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<
        ApiResponse<{
          evaluation: { score: number; feedback: string; strengths: string[]; improvements: string[] };
        }>
      >(`/interviews/${id}/questions/${question._id}/answer`, { content: answer });
      setEvaluation(res.data.evaluation);
      setAnswer('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  async function completeInterview() {
    setSubmitting(true);
    try {
      await api.post(`/interviews/${id}/complete`);
      router.push(`/interviews/${id}/feedback`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview');
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    setEvaluation(null);
    if (session && currentIndex < session.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !session) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!session) return null;

  const question = session.questions[currentIndex];
  const isLast = currentIndex === session.questions.length - 1;
  const allAnswered = session.answers.length >= session.questions.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{session.interview.title}</h1>
          <p className="text-sm text-slate-500">
            Question {currentIndex + 1} of {session.questions.length}
          </p>
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${((currentIndex + 1) / session.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 capitalize">
          {question.category.replace('_', ' ')} · {question.difficulty}
        </span>
        <h2 className="mt-4 text-lg font-medium text-slate-900">{question.text}</h2>

        {!evaluation ? (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="mt-6 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Type your answer here..."
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <Button
              className="mt-4"
              onClick={submitAnswer}
              isLoading={submitting}
              disabled={!answer.trim()}
            >
              Submit Answer
            </Button>
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-brand-50 p-4">
              <p className="text-sm font-medium text-brand-800">Score: {evaluation.score}/100</p>
              <p className="mt-2 text-sm text-slate-700">{evaluation.feedback}</p>
            </div>
            {evaluation.strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-700">Strengths</p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                  {evaluation.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              {!isLast ? (
                <Button onClick={nextQuestion}>Next Question</Button>
              ) : (
                <Button onClick={completeInterview} isLoading={submitting}>
                  Complete Interview
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {allAnswered && !evaluation && (
        <div className="mt-6 text-center">
          <Button onClick={completeInterview} isLoading={submitting}>
            Finish & Get Full Feedback
          </Button>
        </div>
      )}
    </div>
  );
}
