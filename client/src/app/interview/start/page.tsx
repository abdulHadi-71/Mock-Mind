'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { startInterview } from '@/lib/interview';
import { saveInterviewBootstrap } from '@/lib/interview-bootstrap';

const ROLES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data Engineering' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'qa', label: 'QA' },
  { value: 'product', label: 'Product' },
];

const DIFFICULTIES = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
];

const TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'mixed', label: 'Mixed' },
];

export default function StartInterviewPage() {
  return (
    <DashboardLayout>
      <StartForm />
    </DashboardLayout>
  );
}

function StartForm() {
  const router = useRouter();
  const [role, setRole] = useState('fullstack');
  const [difficulty, setDifficulty] = useState('mid');
  const [type, setType] = useState('mixed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    setLoading(true);
    setError('');
    try {
      const res = await startInterview({ role, difficulty, type });
      const { interview } = res.data;
      const interviewId = String(interview._id);

      saveInterviewBootstrap({
        interviewId,
        title: String(interview.title ?? 'Interview'),
        questionCount: Number(interview.questionCount ?? 12),
        firstQuestion: '',
        needsGeneration: true,
      });

      router.push(`/interview/session/${interviewId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Start Mock Interview</h1>
      <p className="mt-2 text-slate-500">
        AI will ask 10–15 contextual questions tailored to your role and level
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <Field label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Interview Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" onClick={handleStart} isLoading={loading}>
          {loading ? 'Starting…' : 'Start Interview'}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
