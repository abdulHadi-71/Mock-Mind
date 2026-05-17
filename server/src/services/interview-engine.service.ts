import { Types } from 'mongoose';
import {
  Interview,
  Question,
  Answer,
  FeedbackReport,
  Score,
  IInterview,
  JobRole,
  Difficulty,
  InterviewType,
} from '../models';
import { ApiError } from '../utils/ApiError';
import { aiService } from './ai.service';
import type { AIInterviewResponse } from '../types/ai.types';

const ROLE_LABELS: Record<JobRole, string> = {
  frontend: 'Frontend Engineer',
  backend: 'Backend Engineer',
  fullstack: 'Full Stack Engineer',
  devops: 'DevOps Engineer',
  data: 'Data Engineer',
  mobile: 'Mobile Developer',
  qa: 'QA Engineer',
  product: 'Product Manager',
};

export interface StartInterviewInput {
  userId: string;
  role: JobRole;
  difficulty: Difficulty;
  type: InterviewType;
  questionCount?: number;
}

export interface SubmitAnswerInput {
  userId: string;
  interviewId: string;
  answer: string;
  durationSeconds?: number;
}

function randomQuestionCount(): number {
  return Math.floor(Math.random() * 6) + 10; // 10–15 questions
}

export class InterviewEngineService {
  /** Creates interview record only — fast response for navigation. */
  async start(input: StartInterviewInput) {
    const roleLabel = ROLE_LABELS[input.role];
    const questionCount = input.questionCount ?? randomQuestionCount();
    const interview = await Interview.create({
      userId: new Types.ObjectId(input.userId),
      title: `${roleLabel} — ${input.difficulty} ${input.type}`,
      role: input.role,
      difficulty: input.difficulty,
      experienceLevel: input.difficulty,
      type: input.type,
      jobRole: roleLabel,
      questionCount,
      currentQuestionIndex: 0,
      status: 'in_progress',
      startedAt: new Date(),
    });

    return { interview };
  }

  /** Generates first AI question — call after client navigates to session. */
  async generateFirstQuestion(userId: string, interviewId: string) {
    const interview = await this.getOwnedInterview(userId, interviewId);
    if (interview.status !== 'in_progress') {
      throw new ApiError(400, 'Interview is not in progress');
    }

    const existing = await Question.findOne({ interviewId: interview._id, order: 0 });
    if (existing) {
      return {
        interview,
        question: existing,
        aiResponse: { question: existing.text, nextQuestion: existing.text },
      };
    }

    const ctx = this.buildContext(interview, []);
    const aiResponse = await aiService.generateFirstQuestion(ctx);

    const question = await Question.create({
      interviewId: interview._id,
      order: 0,
      text: aiResponse.nextQuestion || aiResponse.question,
      category: this.mapTypeToCategory(interview.type),
      difficulty:
        interview.difficulty === 'junior'
          ? 'easy'
          : interview.difficulty === 'senior'
            ? 'hard'
            : 'medium',
    });

    return {
      interview,
      question,
      aiResponse: this.formatResponse(aiResponse, true),
    };
  }

  async submitAnswer(input: SubmitAnswerInput) {
    const interview = await this.getOwnedInterview(input.userId, input.interviewId);
    if (interview.status !== 'in_progress') {
      throw new ApiError(400, 'Interview is not in progress');
    }

    const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    const currentIndex = interview.currentQuestionIndex;
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) {
      throw new ApiError(400, 'No active question');
    }

    const existingAnswers = await Answer.find({ interviewId: interview._id }).sort({ createdAt: 1 });
    const history = await this.buildHistory(questions, existingAnswers);

    const ctx = this.buildContext(interview, history);
    const aiResponse = await aiService.evaluateAndGenerateNext({
      ctx,
      currentQuestion: currentQuestion.text,
      currentAnswer: input.answer,
      questionNumber: currentIndex + 1,
      maxQuestions: interview.questionCount,
    });

    await Answer.findOneAndUpdate(
      {
        interviewId: interview._id,
        questionId: currentQuestion._id,
        userId: new Types.ObjectId(input.userId),
      },
      {
        content: input.answer,
        score: aiResponse.score,
        aiResponse: aiResponse as unknown as Record<string, unknown>,
        durationSeconds: input.durationSeconds,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const isComplete =
      currentIndex + 1 >= interview.questionCount || !aiResponse.nextQuestion?.trim();

    if (isComplete) {
      const result = await this.finalizeInterview(input.userId, interview._id.toString());
      return {
        aiResponse: this.formatResponse(aiResponse, false),
        isComplete: true,
        ...result,
      };
    }

    const nextIndex = currentIndex + 1;
    const nextQuestion = await Question.create({
      interviewId: interview._id,
      order: nextIndex,
      text: aiResponse.nextQuestion,
      category: this.mapTypeToCategory(interview.type),
      difficulty:
        interview.difficulty === 'junior'
          ? 'easy'
          : interview.difficulty === 'senior'
            ? 'hard'
            : 'medium',
    });

    interview.currentQuestionIndex = nextIndex;
    await interview.save();

    return {
      aiResponse: this.formatResponse(aiResponse, false),
      isComplete: false,
      nextQuestion,
      interview,
    };
  }

  async getNextQuestion(userId: string, interviewId: string) {
    const interview = await this.getOwnedInterview(userId, interviewId);
    const question = await Question.findOne({
      interviewId: interview._id,
      order: interview.currentQuestionIndex,
    });
    if (!question) throw new ApiError(404, 'No question available');
    return { interview, question };
  }

  async getResult(userId: string, interviewId: string) {
    const interview = await this.getOwnedInterview(userId, interviewId);
    const [questions, answers, feedback, score] = await Promise.all([
      Question.find({ interviewId: interview._id }).sort({ order: 1 }).lean(),
      Answer.find({ interviewId: interview._id }).lean(),
      FeedbackReport.findOne({ interviewId: interview._id }).lean(),
      Score.findOne({ interviewId: interview._id }).lean(),
    ]);

    if (interview.status !== 'completed') {
      throw new ApiError(400, 'Interview not yet completed');
    }

    return { interview, questions, answers, feedback, score };
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { userId: new Types.ObjectId(userId) };
    const [interviews, total] = await Promise.all([
      Interview.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Interview.countDocuments(filter),
    ]);
    return { interviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async endInterview(userId: string, interviewId: string) {
    const interview = await this.getOwnedInterview(userId, interviewId);
    if (interview.status === 'completed') {
      throw new ApiError(400, 'Interview already completed');
    }
    return this.finalizeInterview(userId, interviewId);
  }

  async getSession(userId: string, interviewId: string) {
    const interview = await this.getOwnedInterview(userId, interviewId);
    const [questions, answers] = await Promise.all([
      Question.find({ interviewId: interview._id }).sort({ order: 1 }).lean(),
      Answer.find({ interviewId: interview._id }).lean(),
    ]);
    return { interview, questions, answers };
  }

  private async finalizeInterview(userId: string, interviewId: string) {
    const interview = await this.getOwnedInterview(userId, interviewId);
    const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    const answers = await Answer.find({ interviewId: interview._id });
    const history = await this.buildHistory(questions, answers);
    const scoredHistory = history.filter((h) => h.score != null) as Array<{
      question: string;
      answer: string;
      score: number;
    }>;

    const ctx = this.buildContext(interview, history);
    const summary = await aiService.generateSessionSummary({
      ...ctx,
      history: scoredHistory,
    });

    const avgScore =
      scoredHistory.length > 0
        ? Math.round(scoredHistory.reduce((s, h) => s + h.score, 0) / scoredHistory.length)
        : summary.overallScore;

    const [feedback, scoreDoc] = await Promise.all([
      FeedbackReport.findOneAndUpdate(
        { interviewId: interview._id },
        {
          userId: new Types.ObjectId(userId),
          summary: summary.summary,
          strengths: summary.strengths,
          improvements: summary.improvements,
          sections: summary.sections,
          fullAiReport: summary as unknown as Record<string, unknown>,
          aiModel: process.env.AI_MODEL,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      ),
      Score.findOneAndUpdate(
        { interviewId: interview._id },
        {
          userId: new Types.ObjectId(userId),
          overallScore: avgScore,
          maxOverallScore: 100,
          categories: summary.categories,
        },
        { upsert: true, new: true }
      ),
    ]);

    interview.status = 'completed';
    interview.finalScore = avgScore;
    interview.completedAt = new Date();
    await interview.save();

    const { emailService } = await import('./email.service');
    emailService.sendInterviewReport(userId, interview._id.toString()).catch(console.error);

    return { interview, feedback, score: scoreDoc, summary };
  }

  private buildContext(
    interview: IInterview,
    history: Array<{ question: string; answer: string; score?: number }>
  ) {
    return {
      role: ROLE_LABELS[interview.role] ?? interview.jobRole ?? 'Software Engineer',
      difficulty: interview.difficulty,
      type: interview.type,
      history,
    };
  }

  private async buildHistory(
    questions: Array<{ _id: Types.ObjectId; text: string; order: number }>,
    answers: Array<{ questionId: Types.ObjectId; content: string; score?: number }>
  ) {
    return questions
      .map((q) => {
        const ans = answers.find((a) => a.questionId.equals(q._id));
        if (!ans) return null;
        return { question: q.text, answer: ans.content, score: ans.score };
      })
      .filter(Boolean) as Array<{ question: string; answer: string; score?: number }>;
  }

  private formatResponse(ai: AIInterviewResponse, isFirst: boolean) {
    return {
      question: ai.question,
      score: ai.score,
      feedback: ai.feedback,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      suggestions: ai.suggestions,
      nextQuestion: isFirst ? ai.nextQuestion || ai.question : ai.nextQuestion,
    };
  }

  private mapTypeToCategory(type: InterviewType) {
    if (type === 'behavioral') return 'behavioral' as const;
    if (type === 'technical') return 'technical' as const;
    return 'situational' as const;
  }

  private async getOwnedInterview(userId: string, interviewId: string): Promise<IInterview> {
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: new Types.ObjectId(userId),
    });
    if (!interview) throw new ApiError(404, 'Interview not found');
    return interview;
  }
}

export const interviewEngineService = new InterviewEngineService();
