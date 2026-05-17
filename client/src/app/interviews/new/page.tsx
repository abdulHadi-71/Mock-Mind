'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import type { ApiResponse, Interview } from '@/types';

const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'system_design', label: 'System Design' },
  { value: 'mixed', label: 'Mixed' },
] as const;

const LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
] as const;

export default function NewInterviewPage() {
  return (
    <ProtectedRoute>
      <NewInterviewForm />
    </ProtectedRoute>
  );
}

function NewInterviewForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('mixed');
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>('mid');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post<ApiResponse<Interview>>('/interviews', {
        title,
        type,
        jobRole: jobRole || undefined,
        experienceLevel,
        questionCount: 5,
      });
      router.push(`/interviews/${res.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">New Mock Interview</h1>
      <p className="mt-2 text-slate-600">Configure your session — AI will generate tailored questions</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <Input label="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Interview Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {INTERVIEW_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Target Role (optional)"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="e.g. Full Stack Engineer"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Experience Level</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Generate Interview
        </Button>
      </form>
    </div>
  );
}
