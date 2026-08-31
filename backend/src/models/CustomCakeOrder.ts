import { Schema, model, Document, Types } from 'mongoose';
import { CakeOrderStatus } from '../constants/enums';

export interface ICustomCakeOrder extends Document {
  organizationId: Types.ObjectId;
  orderId?: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  deliveryDateTime: Date;
  cakeFlavour: string;
  cakeWeightKg: number;
  customMessage?: string;
  customInstructions?: string;
  referenceImageUrl?: string;
  totalPrice: number;
  advancePaid: number;
  remainingBalance: number;
  status: CakeOrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const customCakeOrderSchema = new Schema<ICustomCakeOrder>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryDateTime: { type: Date, required: true },
    cakeFlavour: { type: String, required: true },
    cakeWeightKg: { type: Number, required: true, min: 0.5 },
    customMessage: { type: String, default: '' },
    customInstructions: { type: String, default: '' },
    referenceImageUrl: { type: String, default: '' },
    totalPrice: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    remainingBalance: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(CakeOrderStatus), default: CakeOrderStatus.RECEIVED }
  },
  { timestamps: true }
);

customCakeOrderSchema.index({ organizationId: 1, deliveryDateTime: 1 });

export const CustomCakeOrder = model<ICustomCakeOrder>('CustomCakeOrder', customCakeOrderSchema);
