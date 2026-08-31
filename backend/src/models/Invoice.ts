import { Schema, model, Document, Types } from 'mongoose';
import { PaymentMethod } from '../constants/enums';

export interface IPaymentDetail {
  method: PaymentMethod;
  amount: number;
  transactionRef?: string;
}

export interface IInvoice extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  invoiceNumber: string; // e.g. ABC-2026-0001
  orderId: Types.ObjectId;
  customerId?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentDetails: IPaymentDetail[];
  isRefunded: boolean;
  refundReason?: string;
  pdfUrl?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    invoiceNumber: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentDetails: [
      {
        method: { type: String, enum: Object.values(PaymentMethod), required: true },
        amount: { type: Number, required: true },
        transactionRef: { type: String, default: '' }
      }
    ],
    isRefunded: { type: Boolean, default: false },
    refundReason: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

invoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
