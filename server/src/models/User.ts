import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshTokenEntry {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  name: string;
  role: 'candidate' | 'admin';
  refreshTokens: IRefreshTokenEntry[];
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshTokenEntry>(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    googleId: { type: String, sparse: true, unique: true, index: true },
    avatarUrl: { type: String },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
