export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface Interview {
  _id: string;
  title: string;
  type: string;
  status: string;
  jobRole?: string;
  experienceLevel?: string;
  durationMinutes: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Question {
  _id: string;
  interviewId: string;
  order: number;
  text: string;
  category: string;
  difficulty: string;
  timeLimitSeconds?: number;
}

export interface Answer {
  _id: string;
  questionId: string;
  content: string;
  submittedAt: string;
}

export interface PerformanceHistory {
  averageScore: number;
  completedInterviews: number;
  recentScores: Array<{
    _id: string;
    overallScore: number;
    interviewId: { title: string; type: string; status: string };
    createdAt: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
