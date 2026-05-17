'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StopCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { ChatMessage } from '@/components/interview/ChatInterface';
import { InterviewProgress } from '@/components/interview/InterviewProgress';
import { Button } from '@/components/ui/Button';
import { connectSocket, getSocket } from '@/lib/socket';
import { generateFirstQuestion, getInterviewSession, submitAnswer } from '@/lib/interview';
import { peekInterviewBootstrap, clearInterviewBootstrap } from '@/lib/interview-bootstrap';
import { api } from '@/lib/api';
import type { AIResponse } from '@/lib/interview';

const ChatInterface = dynamic(
  () => import('@/components/interview/ChatInterface').then((mod) => mod.ChatInterface),
  {
    ssr: false,
    loading: () => <div className="flex-1 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />,
  }
);

const VoiceInput = dynamic(() => import('@/components/interview/VoiceInput').then((mod) => mod.VoiceInput), {
  ssr: false,
});

function buildMessagesFromSession(
  questions: Array<{ _id: string; text: string; order: number }>,
  answers: Array<{
    questionId: string;
    content: string;
    score?: number;
    aiResponse?: AIResponse;
  }>,
  currentIndex: number,
  fallbackQuestion?: string
): ChatMessage[] {
  const msgs: ChatMessage[] = [];
  let nid = 0;

  for (let i = 0; i <= currentIndex; i++) {
    const q = questions.find((x) => x.order === i);
    if (!q) continue;

    const ans = answers.find((a) => String(a.questionId) === String(q._id));

    if (ans) {
      msgs.push({ id: `q-${nid++}`, role: 'ai', content: q.text, timestamp: new Date() });
      msgs.push({ id: `a-${nid++}`, role: 'user', content: ans.content, timestamp: new Date() });
      if (ans.aiResponse?.feedback) {
        msgs.push({
          id: `f-${nid++}`,
          role: 'ai',
          content: ans.aiResponse.feedback,
          meta: ans.aiResponse,
          timestamp: new Date(),
        });
      }
    } else if (i === currentIndex) {
      msgs.push({ id: `q-${nid++}`, role: 'ai', content: q.text, timestamp: new Date() });
    }
  }

  if (msgs.length === 0 && fallbackQuestion) {
    msgs.push({ id: 'q-0', role: 'ai', content: fallbackQuestion, timestamp: new Date() });
  }

  return msgs;
}

export default function InterviewSessionPage() {
  return (
    <DashboardLayout>
      <SessionContent />
    </DashboardLayout>
  );
}

function SessionContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const bootstrap = useMemo(() => peekInterviewBootstrap(id), [id]);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    bootstrap?.firstQuestion
      ? [{ id: 'boot-q', role: 'ai', content: bootstrap.firstQuestion, timestamp: new Date() }]
      : []
  );
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [loading, setLoading] = useState(
    !bootstrap?.firstQuestion || Boolean(bootstrap?.needsGeneration)
  );
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [title, setTitle] = useState(bootstrap?.title ?? '');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(bootstrap?.questionCount ?? 12);

  const addMessage = useCallback(
    (role: 'ai' | 'user', content: string, meta?: Partial<AIResponse>) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          role,
          content,
          meta,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoadError('');
      try {
        if (bootstrap?.needsGeneration) {
          setAiTyping(true);
          const gen = await generateFirstQuestion(id);
          if (!active) return;
          const qText =
            gen.data.question?.text ||
            gen.data.aiResponse?.nextQuestion ||
            gen.data.aiResponse?.question ||
            '';
          if (qText) {
            setMessages([{ id: 'q-0', role: 'ai', content: qText, timestamp: new Date() }]);
          }
          setTitle(String(gen.data.interview?.title ?? bootstrap.title ?? 'Interview'));
          setTotalQuestions(Number(gen.data.interview?.questionCount ?? bootstrap.questionCount ?? 12));
          setCurrentQuestion(1);
          setAiTyping(false);
          clearInterviewBootstrap(id);
          setLoading(false);
          return;
        }

        const res = await getInterviewSession(id);
        if (!active) return;

        const interview = res.data.interview as {
          title?: string;
          currentQuestionIndex?: number;
          questionCount?: number;
          status?: string;
        };
        const { questions, answers } = res.data;

        if (questions.length === 0) {
          setAiTyping(true);
          const gen = await generateFirstQuestion(id);
          if (!active) return;
          const qText =
            gen.data.question?.text ||
            gen.data.aiResponse?.nextQuestion ||
            gen.data.aiResponse?.question ||
            '';
          if (qText) {
            setMessages([{ id: 'q-0', role: 'ai', content: qText, timestamp: new Date() }]);
          }
          setAiTyping(false);
        } else {
          setTitle(String(interview.title ?? bootstrap?.title ?? 'Interview'));
          const idx = Number(interview.currentQuestionIndex ?? 0);
          const total = Number(interview.questionCount ?? bootstrap?.questionCount ?? 12);
          setCurrentQuestion(idx + 1);
          setTotalQuestions(total);

          const built = buildMessagesFromSession(
            questions,
            answers,
            idx,
            bootstrap?.firstQuestion
          );
          if (built.length > 0) {
            setMessages(built);
          }
        }

        clearInterviewBootstrap(id);

        if (interview.status === 'completed') {
          router.replace(`/results/${id}`);
        }
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load interview');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [
    id,
    router,
    bootstrap?.firstQuestion,
    bootstrap?.title,
    bootstrap?.questionCount,
    bootstrap?.needsGeneration,
  ]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit('join_interview', { interviewId: id });
    const onTyping = (data: { typing: boolean }) => setAiTyping(data.typing);
    socket.on('ai_typing', onTyping);
    return () => {
      socket.emit('leave_interview', { interviewId: id });
      socket.off('ai_typing', onTyping);
    };
  }, [id]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || submitting) return;

    const answerText = input.trim();
    setInput('');
    addMessage('user', answerText);
    setSubmitting(true);
    setAiTyping(true);
    getSocket().emit('user_answer', { interviewId: id, answer: answerText });

    try {
      const res = await submitAnswer(id, answerText);
      const { aiResponse, isComplete } = res.data;

      if (aiResponse.feedback) {
        addMessage('ai', aiResponse.feedback, aiResponse);
      }

      if (isComplete) {
        router.push(`/results/${id}`);
        return;
      }

      if (aiResponse.nextQuestion) {
        addMessage('ai', aiResponse.nextQuestion);
      }

      const session = await getInterviewSession(id);
      const idx = Number(
        (session.data.interview as { currentQuestionIndex?: number }).currentQuestionIndex ?? 0
      );
      setCurrentQuestion(idx + 1);
    } catch (err) {
      addMessage('ai', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
      setAiTyping(false);
    }
  }

  async function handleEndInterview() {
    if (!confirm('End this interview early? You will receive feedback based on answers so far.')) {
      return;
    }
    setEnding(true);
    try {
      await api.post('/interview/end', { interviewId: id });
      router.push(`/results/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to end interview');
    } finally {
      setEnding(false);
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Preparing your interview…</p>
        <p className="text-xs text-slate-400">AI is generating your first question</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh)] flex-col p-4 lg:p-6 animate-slide-up">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title || 'Interview'}</h1>
        <Button variant="danger" size="sm" onClick={handleEndInterview} isLoading={ending}>
          <StopCircle className="mr-2 h-4 w-4" />
          End Interview
        </Button>
      </div>

      <InterviewProgress current={currentQuestion} total={totalQuestions} />

      {loadError && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
      )}

      <div className="mt-4 flex min-h-0 flex-1 flex-col" style={{ minHeight: '320px' }}>
        <ChatInterface messages={messages} aiTyping={aiTyping} />
      </div>

      {messages.length === 0 && !loading && (
        <p className="mt-4 text-center text-sm text-slate-500">
          No questions loaded.{' '}
          <button type="button" className="text-indigo-600 underline" onClick={() => window.location.reload()}>
            Retry
          </button>
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800"
      >
        <VoiceInput
          onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
          disabled={submitting || ending}
        />
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Type your answer…"
            className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
          />
          <Button type="submit" isLoading={submitting} disabled={!input.trim() || ending}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
