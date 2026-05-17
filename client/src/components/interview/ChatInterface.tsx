'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import type { AIResponse } from '@/lib/interview';

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  meta?: Partial<AIResponse>;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  aiTyping?: boolean;
}

export function ChatInterface({ messages, aiTyping }: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            style={{ animationDelay: `${Math.min(i * 40, 200)}ms` }}
            className={clsx(
              'flex gap-3 animate-message-in',
              msg.role === 'user' ? 'flex-row-reverse' : ''
            )}
          >
            <div
              className={clsx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
              )}
            >
              {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={clsx(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'ai'
                  ? 'rounded-tl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  : 'rounded-tr-sm bg-indigo-600 text-white'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.meta?.score != null && msg.meta.score > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-200/50 pt-3 dark:border-slate-600">
                  <p className="text-xs font-semibold">Score: {msg.meta.score}/100</p>
                  {msg.meta.feedback && (
                    <p className="text-xs opacity-90">{msg.meta.feedback}</p>
                  )}
                  {msg.meta.strengths && msg.meta.strengths.length > 0 && (
                    <p className="text-xs text-green-600">+ {msg.meta.strengths.join(', ')}</p>
                  )}
                  {msg.meta.weaknesses && msg.meta.weaknesses.length > 0 && (
                    <p className="text-xs text-amber-600">− {msg.meta.weaknesses.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {aiTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <Bot className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
              </div>
              <p className="mt-1 text-xs text-slate-500">AI is thinking…</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
