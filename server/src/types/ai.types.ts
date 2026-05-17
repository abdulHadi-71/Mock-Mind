export interface AIInterviewResponse {
  question: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  nextQuestion: string;
}

export interface AISessionSummary {
  summary: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  sections: Array<{ title: string; content: string; rating?: number }>;
  categories: Array<{ name: string; score: number; maxScore: number; notes?: string }>;
  hireRecommendation: string;
  skillBreakdown: Array<{ skill: string; score: number }>;
}

export function parseAIInterviewResponse(raw: string): AIInterviewResponse {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned) as Partial<AIInterviewResponse>;

  return {
    question: String(parsed.question ?? ''),
    score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
    feedback: String(parsed.feedback ?? ''),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
    nextQuestion: String(parsed.nextQuestion ?? ''),
  };
}
