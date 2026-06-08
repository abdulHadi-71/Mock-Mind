'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, Sparkles, Brain, Zap, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { startInterview } from '@/lib/interview';
import { saveInterviewBootstrap } from '@/lib/interview-bootstrap';

const ROLES = [
  { value: 'frontend', label: 'Frontend', icon: '🎨' },
  { value: 'backend', label: 'Backend', icon: '⚙️' },
  { value: 'fullstack', label: 'Full Stack', icon: '🔗' },
  { value: 'devops', label: 'DevOps', icon: '🚀' },
  { value: 'data', label: 'Data Engineering', icon: '📊' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'qa', label: 'QA', icon: '🧪' },
  { value: 'product', label: 'Product', icon: '📋' },
];

const DIFFICULTIES = [
  { value: 'junior', label: 'Junior', desc: 'Basics & fundamentals', color: 'from-emerald-500 to-teal-500' },
  { value: 'mid', label: 'Mid-Level', desc: 'Applied knowledge', color: 'from-blue-500 to-indigo-500' },
  { value: 'senior', label: 'Senior', desc: 'Architecture & leadership', color: 'from-purple-500 to-pink-500' },
];

const TYPES = [
  { value: 'technical', label: 'Technical', icon: Brain },
  { value: 'behavioral', label: 'Behavioral', icon: Shield },
  { value: 'mixed', label: 'Mixed', icon: Zap },
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
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setCvFile(file);
    } else {
      setError('Only PDF and TXT files are supported');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setError('');
    }
  }, []);

  async function handleStart() {
    if (!cvFile) {
      setError('Please upload your CV to start the interview');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await startInterview({ role, difficulty, type, cvFile });
      const { interview } = res.data;
      const interviewId = String(interview._id);

      saveInterviewBootstrap({
        interviewId,
        title: String(interview.title ?? 'Interview'),
        questionCount: Number(interview.questionCount ?? 20),
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
    <div className="mx-auto max-w-3xl p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mb-4">
          <Sparkles className="h-4 w-4" />
          AI-Powered Mock Interview
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Start Your Interview
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Upload your CV and AI will generate 20 personalized questions tailored to your experience
        </p>
      </div>

      <div className="space-y-8">
        {/* CV Upload Section */}
        <section
          className={`rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.01]'
              : cvFile
                ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20'
                : 'border-slate-300 bg-white hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 hover:bg-brand-50/30 dark:hover:bg-brand-950/10'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
        >
          {cvFile ? (
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <FileText className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{cvFile.name}</p>
                  <p className="text-sm text-slate-500">{(cvFile.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                </div>
              </div>
              <button
                onClick={() => setCvFile(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-4 p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 dark:from-brand-500/20 dark:to-purple-500/20">
                <Upload className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  Upload your CV
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Drag & drop or <span className="text-brand-600 dark:text-brand-400 underline">browse</span> · PDF or TXT up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}
        </section>

        {/* Role Selection */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Target Role</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${role === r.value
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-[1.02]'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:border-brand-600'
                  }`}
              >
                <span>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty Selection */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Difficulty Level</h2>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`relative rounded-xl p-4 text-left transition-all duration-200 overflow-hidden
                  ${difficulty === d.value
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-900 scale-[1.02]'
                    : 'bg-white text-slate-700 border border-slate-200 hover:shadow-md dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                  }`}
              >
                {difficulty === d.value && (
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${d.color}`} />
                )}
                <p className="font-bold text-sm">{d.label}</p>
                <p className={`text-xs mt-0.5 ${difficulty === d.value ? 'opacity-70' : 'text-slate-500'}`}>{d.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Interview Type */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Interview Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200
                    ${type === t.value
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-[1.02]'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Question Info */}
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30 px-5 py-4 border border-brand-100 dark:border-brand-900/30">
          <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">20 questions</span> will be generated: 5 Easy, 5 Normal, 5 Hard, 5 Problem Solving — all based on your CV
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3 border border-red-200 dark:border-red-800">
            {error}
          </p>
        )}

        {/* Start Button */}
        <Button
          className="w-full !py-4 !text-base !rounded-xl"
          onClick={handleStart}
          isLoading={loading}
          disabled={!cvFile}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Analyzing CV & Generating Questions…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Start Interview
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
