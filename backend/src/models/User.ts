import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
