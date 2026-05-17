import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeedbackSection {
  title: string;
  content: string;
  rating?: number;
}

export interface IFeedbackReport extends Document {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  userId: Types.ObjectId;
  summary: string;
  strengths: string[];
  improvements: string[];
  sections: IFeedbackSection[];
  aiModel?: string;
  fullAiReport?: Record<string, unknown>;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSectionSchema = new Schema<IFeedbackSection>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 0, max: 10 },
  },
  { _id: false }
);

const feedbackReportSchema = new Schema<IFeedbackReport>(
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
    summary: { type: String, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    sections: { type: [feedbackSectionSchema], default: [] },
    aiModel: { type: String },
    fullAiReport: { type: Schema.Types.Mixed },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

feedbackReportSchema.index({ userId: 1, generatedAt: -1 });

export const FeedbackReport = mongoose.model<IFeedbackReport>(
  'FeedbackReport',
  feedbackReportSchema
);
