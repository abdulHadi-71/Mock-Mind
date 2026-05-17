export const SYSTEM_RECRUITER = `You are a senior professional technical recruiter conducting a live mock interview.
Rules:
- Be strict but fair. Evaluate like a real hiring manager.
- Consider the candidate's role, difficulty level, and full Q/A history.
- Generate dynamic follow-up questions based on previous answers.
- NEVER return plain text. ALWAYS return valid JSON only.
- No markdown, no code fences, no explanation outside JSON.`;

export const INTERVIEW_RESPONSE_SCHEMA = `{
  "question": "current or next interview question text",
  "score": 0-100,
  "feedback": "detailed evaluation of the last answer (empty string if first question)",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "nextQuestion": "the next question to ask (empty if interview complete)"
}`;

export function buildStartPrompt(params: {
  role: string;
  difficulty: string;
  type: string;
}): string {
  return `Start a mock interview session.

Role: ${params.role}
Difficulty: ${params.difficulty}
Type: ${params.type}

Generate the FIRST interview question only. Set score to 0, feedback to empty string, strengths/weaknesses/suggestions to empty arrays.
Put the first question in both "question" and "nextQuestion" fields.

Return JSON matching exactly:
${INTERVIEW_RESPONSE_SCHEMA}`;
}

export function buildEvaluatePrompt(params: {
  role: string;
  difficulty: string;
  type: string;
  history: Array<{ question: string; answer: string; score?: number }>;
  currentQuestion: string;
  currentAnswer: string;
  questionNumber: number;
  maxQuestions: number;
}): string {
  const historyText =
    params.history.length > 0
      ? params.history
          .map(
            (h, i) =>
              `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}\nScore: ${h.score ?? 'N/A'}`
          )
          .join('\n\n')
      : 'No previous questions.';

  const isLast = params.questionNumber >= params.maxQuestions;

  return `Evaluate the candidate's answer and generate the next step.

Role: ${params.role}
Difficulty: ${params.difficulty}
Type: ${params.type}
Question ${params.questionNumber} of ${params.maxQuestions}

Previous Q/A History:
${historyText}

Current Question: ${params.currentQuestion}
Candidate Answer: ${params.currentAnswer}

Instructions:
1. Score the current answer (0-100) with detailed feedback, strengths, weaknesses, suggestions.
2. ${isLast ? 'This is the FINAL question. Set nextQuestion to empty string and question to a brief closing message.' : 'Generate a contextual follow-up question in nextQuestion based on their answer.'}
3. Put evaluation summary in "feedback". The "question" field should reflect the question that was just answered.

Return JSON matching exactly:
${INTERVIEW_RESPONSE_SCHEMA}`;
}

export function buildSessionSummaryPrompt(params: {
  role: string;
  difficulty: string;
  type: string;
  history: Array<{ question: string; answer: string; score: number }>;
}): string {
  const historyText = params.history
    .map((h, i) => `Q${i + 1}: ${h.question}\nA: ${h.answer}\nScore: ${h.score}`)
    .join('\n\n');

  return `Generate a final interview report.

Role: ${params.role} | Difficulty: ${params.difficulty} | Type: ${params.type}

${historyText}

Return JSON:
{
  "summary": "executive summary",
  "overallScore": 0-100,
  "strengths": ["..."],
  "improvements": ["..."],
  "sections": [{ "title": "...", "content": "...", "rating": 0-10 }],
  "categories": [{ "name": "...", "score": 0-100, "maxScore": 100, "notes": "..." }],
  "hireRecommendation": "strong_yes|yes|maybe|no",
  "skillBreakdown": [{ "skill": "...", "score": 0-100 }]
}`;
}
