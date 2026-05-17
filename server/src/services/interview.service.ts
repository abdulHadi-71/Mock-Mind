/**
 * Legacy facade — delegates to interview engine v2.
 */
import { interviewEngineService, StartInterviewInput, SubmitAnswerInput } from './interview-engine.service';

export type { StartInterviewInput, SubmitAnswerInput };

export class InterviewService {
  start = (input: StartInterviewInput) => interviewEngineService.start(input);
  submitAnswer = (input: SubmitAnswerInput) => interviewEngineService.submitAnswer(input);
  getResult = (userId: string, id: string) => interviewEngineService.getResult(userId, id);
  getHistory = (userId: string, page?: number, limit?: number) =>
    interviewEngineService.getHistory(userId, page, limit);
  getSession = (userId: string, id: string) => interviewEngineService.getSession(userId, id);
  getNextQuestion = (userId: string, id: string) =>
    interviewEngineService.getNextQuestion(userId, id);

  // Legacy aliases
  create = (input: StartInterviewInput & { title?: string }) =>
    interviewEngineService.start(input);
  list = (userId: string, page?: number, limit?: number) =>
    interviewEngineService.getHistory(userId, page, limit);
  get = (userId: string, id: string) => interviewEngineService.getSession(userId, id);
  getFeedback = (userId: string, id: string) => interviewEngineService.getResult(userId, id);
  complete = (userId: string, id: string) => interviewEngineService.getResult(userId, id);
}

export const interviewService = new InterviewService();
