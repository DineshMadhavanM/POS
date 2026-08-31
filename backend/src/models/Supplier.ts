import { Schema, model, Document, Types } from 'mongoose';

export interface ISupplier extends Document {
  organizationId: Types.ObjectId;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    gstin: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  { timestamps: true }
);

supplierSchema.index({ organizationId: 1, name: 1 });

export const Supplier = model<ISupplier>('Supplier', supplierSchema);
