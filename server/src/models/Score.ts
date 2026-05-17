import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export interface IScore extends Document {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  userId: Types.ObjectId;
  overallScore: number;
  maxOverallScore: number;
  categories: IScoreCategory[];
  percentile?: number;
  createdAt: Date;
  updatedAt: Date;
}

const scoreCategorySchema = new Schema<IScoreCategory>(
  {
    name: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    notes: { type: String },
  },
  { _id: false }
);

const scoreSchema = new Schema<IScore>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallScore: { type: Number, required: true, min: 0 },
    maxOverallScore: { type: Number, required: true, default: 100 },
    categories: { type: [scoreCategorySchema], default: [] },
    percentile: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

scoreSchema.index({ userId: 1, createdAt: -1 });
scoreSchema.index({ overallScore: -1 });

export const Score = mongoose.model<IScore>('Score', scoreSchema);
