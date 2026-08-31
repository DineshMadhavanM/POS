import { Schema, model, Document, Types } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../constants/enums';

export interface ISubscription extends Document {
  organizationId: Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  paymentHistory: {
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    transactionId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    plan: { type: String, enum: Object.values(SubscriptionPlan), required: true },
    status: { type: String, enum: Object.values(SubscriptionStatus), required: true, default: SubscriptionStatus.ACTIVE },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paymentHistory: [
      {
        amount: { type: Number, required: true },
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: { type: String, default: 'CARD' },
        transactionId: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);
