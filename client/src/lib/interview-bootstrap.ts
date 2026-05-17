const BOOTSTRAP_KEY = 'aimi_interview_bootstrap';

export interface InterviewBootstrap {
  interviewId: string;
  title: string;
  questionCount: number;
  firstQuestion: string;
  needsGeneration?: boolean;
}

export function saveInterviewBootstrap(data: InterviewBootstrap): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BOOTSTRAP_KEY, JSON.stringify(data));
}

export function peekInterviewBootstrap(interviewId: string): InterviewBootstrap | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(BOOTSTRAP_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as InterviewBootstrap;
    return data.interviewId === interviewId ? data : null;
  } catch {
    return null;
  }
}

export function clearInterviewBootstrap(interviewId?: string): void {
  if (typeof window === 'undefined') return;
  if (!interviewId) {
    sessionStorage.removeItem(BOOTSTRAP_KEY);
    return;
  }
  const data = peekInterviewBootstrap(interviewId);
  if (data) sessionStorage.removeItem(BOOTSTRAP_KEY);
}

/** @deprecated use peekInterviewBootstrap */
export function consumeInterviewBootstrap(interviewId: string): InterviewBootstrap | null {
  const data = peekInterviewBootstrap(interviewId);
  if (data) clearInterviewBootstrap(interviewId);
  return data;
}
