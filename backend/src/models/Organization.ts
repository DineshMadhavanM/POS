import { Schema, model, Document, Types } from 'mongoose';
import { BusinessType, SubscriptionPlan, SubscriptionStatus } from '../constants/enums';

export interface IOrganization extends Document {
  businessName: string;
  businessType: BusinessType;
  companyId: string;
  ownerId: Types.ObjectId;
  email: string;
  phoneNumber?: string;
  address?: string;
  gstin?: string;
  businessLogo?: string;
  currency: string;
  timezone: string;
  taxRateDefault: number;
  invoicePrefix: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, enum: Object.values(BusinessType), required: true, default: BusinessType.RESTAURANT },
    companyId: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    businessLogo: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'UTC' },
    taxRateDefault: { type: Number, default: 5 },
    invoicePrefix: { type: String, default: 'INV' },
    subscriptionPlan: { type: String, enum: Object.values(SubscriptionPlan), default: SubscriptionPlan.FREE_TRIAL },
    subscriptionStatus: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.ACTIVE }
  },
  { timestamps: true }
);

export const Organization = model<IOrganization>('Organization', organizationSchema);
