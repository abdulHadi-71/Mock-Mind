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

export const CV_QUESTIONS_RESPONSE_SCHEMA = `{
  "questions": [
    {
      "text": "question text",
      "difficulty": "easy" | "medium" | "hard",
      "category": "technical" | "behavioral" | "system_design" | "situational"
    }
  ]
}`;

export function buildCvQuestionsPrompt(params: {
  cvText: string;
  role: string;
  difficulty: string;
  type: string;
}): string {
  return `You are a senior professional recruiter and technical interviewer.
Analyze the candidate's CV provided below and generate a list of exactly 20 interview questions tailored to their background, projects, and skills.
The questions must align with the target role: "${params.role}" and general level: "${params.difficulty}".

Candidate CV:
${params.cvText}

You MUST generate exactly 20 questions, distributed as follows:
- 5 Easy questions (basic concepts and terminology related to the candidate's CV and role)
- 5 Medium/Normal questions (scenario-based, situational, or common practical problems they've faced in their projects)
- 5 Hard questions (deep architectural, optimization, system-design or advanced technical aspects of their stack)
- 5 Problem Solving questions (logical scenarios, algorithmic puzzles, complex troubleshooting, or challenging design problems relevant to their expertise)

For each question, assign a difficulty ('easy', 'medium', 'hard') and a category ('technical', 'behavioral', 'system_design', 'situational').

Please order the 20 questions in the array so that:
- Questions 1 to 5 are Easy
- Questions 6 to 10 are Medium
- Questions 11 to 15 are Hard
- Questions 16 to 20 are Problem Solving

Return ONLY a valid JSON object matching this schema, without any explanations or markdown formatting:
${CV_QUESTIONS_RESPONSE_SCHEMA}`;
}

export function buildEvaluateAnswerPrompt(params: {
  role: string;
  difficulty: string;
  type: string;
  question: string;
  answer: string;
}): string {
  return `Evaluate the candidate's answer for the following question.

Role: ${params.role}
Difficulty: ${params.difficulty}
Type: ${params.type}

Question: ${params.question}
Candidate's Answer: ${params.answer}

Instructions:
1. Score the answer (0-100).
2. Provide constructive feedback, strengths, weaknesses, and suggestions.
3. Keep the "question" and "nextQuestion" fields empty or put the current question in "question".

Return JSON matching exactly:
${INTERVIEW_RESPONSE_SCHEMA}`;
}

