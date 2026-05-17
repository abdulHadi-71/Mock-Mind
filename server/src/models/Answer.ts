import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnswer extends Document {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  questionId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  score?: number;
  aiResponse?: Record<string, unknown>;
  durationSeconds?: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    aiResponse: { type: Schema.Types.Mixed },
    durationSeconds: { type: Number, min: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

answerSchema.index({ interviewId: 1, questionId: 1 }, { unique: true });
answerSchema.index({ userId: 1, submittedAt: -1 });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
