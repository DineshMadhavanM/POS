import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  organizationId: Types.ObjectId;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    address: { type: String, default: '' },
    totalPurchases: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 }
  },
  { timestamps: true }
);

customerSchema.index({ organizationId: 1, phoneNumber: 1 });

export const Customer = model<ICustomer>('Customer', customerSchema);
