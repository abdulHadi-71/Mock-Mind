import mongoose, { Document, Schema, Types } from 'mongoose';

export type InterviewStatus =
  | 'draft'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type InterviewType = 'technical' | 'behavioral' | 'mixed';
export type JobRole =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'devops'
  | 'data'
  | 'mobile'
  | 'qa'
  | 'product';
export type Difficulty = 'junior' | 'mid' | 'senior';

export interface IInterview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  role: JobRole;
  difficulty: Difficulty;
  type: InterviewType;
  status: InterviewStatus;
  jobRole?: string;
  experienceLevel?: Difficulty;
  finalScore?: number;
  questionCount: number;
  currentQuestionIndex: number;
  durationMinutes: number;
  cvText?: string;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack', 'devops', 'data', 'mobile', 'qa', 'product'],
      default: 'fullstack',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
      default: 'mid',
      index: true,
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed'],
      default: 'mixed',
    },
    finalScore: { type: Number, min: 0, max: 100 },
    questionCount: { type: Number, default: 5, min: 3, max: 20 },
    currentQuestionIndex: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    jobRole: { type: String, trim: true },
    experienceLevel: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead'],
    },
    durationMinutes: { type: Number, default: 45, min: 15, max: 120 },
    cvText: { type: String, select: false },
    startedAt: { type: Date },
    completedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
