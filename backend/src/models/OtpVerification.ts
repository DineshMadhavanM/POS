import { Schema, model, Document } from 'mongoose';

export interface IOtpVerification extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-expires after 10 minutes (600 seconds)
  },
  { timestamps: false }
);

export const OtpVerification = model<IOtpVerification>('OtpVerification', otpVerificationSchema);
