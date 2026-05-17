import OpenAI from 'openai';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import {
  SYSTEM_RECRUITER,
  buildStartPrompt,
  buildEvaluatePrompt,
  buildSessionSummaryPrompt,
} from '../ai/prompts';
import {
  AIInterviewResponse,
  AISessionSummary,
  parseAIInterviewResponse,
} from '../types/ai.types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InterviewContext {
  role: string;
  difficulty: string;
  type: string;
  history: Array<{ question: string; answer: string; score?: number }>;
}

/**
 * OpenAI-compatible API abstraction — all AI calls go through here.
 */
export class AIService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.AI_API_KEY,
      baseURL: config.AI_BASE_URL,
    });
  }

  private async chatJSON(messages: ChatMessage[], maxTokens = 2048): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: config.AI_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new ApiError(502, 'AI provider returned empty response');
      return content;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'AI request failed';
      throw new ApiError(502, `AI service error: ${message}`);
    }
  }

  async generateFirstQuestion(ctx: InterviewContext): Promise<AIInterviewResponse> {
    const raw = await this.chatJSON([
      { role: 'system', content: SYSTEM_RECRUITER },
      {
        role: 'user',
        content: buildStartPrompt({
          role: ctx.role,
          difficulty: ctx.difficulty,
          type: ctx.type,
        }),
      },
    ]);
    return parseAIInterviewResponse(raw);
  }

  async evaluateAndGenerateNext(params: {
    ctx: InterviewContext;
    currentQuestion: string;
    currentAnswer: string;
    questionNumber: number;
    maxQuestions: number;
  }): Promise<AIInterviewResponse> {
    const raw = await this.chatJSON([
      { role: 'system', content: SYSTEM_RECRUITER },
      {
        role: 'user',
        content: buildEvaluatePrompt({
          role: params.ctx.role,
          difficulty: params.ctx.difficulty,
          type: params.ctx.type,
          history: params.ctx.history,
          currentQuestion: params.currentQuestion,
          currentAnswer: params.currentAnswer,
          questionNumber: params.questionNumber,
          maxQuestions: params.maxQuestions,
        }),
      },
    ], 3000);
    return parseAIInterviewResponse(raw);
  }

  async generateSessionSummary(ctx: InterviewContext & {
    history: Array<{ question: string; answer: string; score: number }>;
  }): Promise<AISessionSummary> {
    const raw = await this.chatJSON([
      { role: 'system', content: SYSTEM_RECRUITER },
      {
        role: 'user',
        content: buildSessionSummaryPrompt({
          role: ctx.role,
          difficulty: ctx.difficulty,
          type: ctx.type,
          history: ctx.history,
        }),
      },
    ], 4000);

    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
    return {
      summary: String(parsed.summary ?? ''),
      overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 0)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
      sections: parsed.sections ?? [],
      categories: parsed.categories ?? [],
      hireRecommendation: String(parsed.hireRecommendation ?? 'maybe'),
      skillBreakdown: parsed.skillBreakdown ?? [],
    };
  }
}

export const aiService = new AIService();
