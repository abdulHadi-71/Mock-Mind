import { api } from './api';
import type { ApiResponse } from '@/types';

export interface AIResponse {
  question: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  nextQuestion: string;
}

export interface StartInterviewPayload {
  role: string;
  difficulty: string;
  type: string;
  questionCount?: number;
}

export async function startInterview(payload: StartInterviewPayload) {
  return api.post<ApiResponse<{
    interview: {
      _id: string;
      title: string;
      status: string;
      questionCount?: number;
    };
  }>>('/interview/start', payload);
}

export async function generateFirstQuestion(interviewId: string) {
  return api.post<ApiResponse<{
    interview: { _id: string; title: string; questionCount?: number };
    question: { _id: string; text: string; order: number };
    aiResponse: AIResponse;
  }>>('/interview/generate-first-question', { interviewId });
}

export async function submitAnswer(interviewId: string, answer: string) {
  return api.post<ApiResponse<{
    aiResponse: AIResponse;
    isComplete: boolean;
    nextQuestion?: { _id: string; text: string };
    interview?: { _id: string; status: string; finalScore?: number };
  }>>('/interview/submit-answer', { interviewId, answer });
}

export async function getInterviewSession(id: string) {
  return api.get<ApiResponse<{
    interview: Record<string, unknown>;
    questions: Array<{ _id: string; text: string; order: number }>;
    answers: Array<{ questionId: string; content: string; score?: number; aiResponse?: AIResponse }>;
  }>>(`/interview/session/${id}`);
}

export async function getInterviewResult(id: string) {
  return api.get<ApiResponse<Record<string, unknown>>>(`/interview/result/${id}`);
}

export async function getInterviewHistory(page = 1) {
  return api.get<ApiResponse<{ interviews: Array<Record<string, unknown>>; total: number }>>(
    `/interview/history?page=${page}`
  );
}

export async function downloadPdfReport(id: string) {
  const token = api.getAccessToken();
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  const res = await fetch(`${base}/reports/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to download PDF');
  return res.blob();
}

export async function emailReport(id: string) {
  return api.post<ApiResponse<{ sent: boolean }>>(`/reports/${id}/email`);
}
