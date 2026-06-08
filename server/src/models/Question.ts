import mongoose, { Document, Schema, Types } from 'mongoose';

export type QuestionCategory =
  | 'technical'
  | 'behavioral'
  | 'system_design'
  | 'situational'
  | 'problem_solving';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  order: number;
  text: string;
  category: QuestionCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedTopics?: string[];
  timeLimitSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    order: { type: Number, required: true, min: 0 },
    text: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'system_design', 'situational', 'problem_solving'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    expectedTopics: [{ type: String }],
    timeLimitSeconds: { type: Number, default: 180 },
  },
  { timestamps: true }
);

questionSchema.index({ interviewId: 1, order: 1 }, { unique: true });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
