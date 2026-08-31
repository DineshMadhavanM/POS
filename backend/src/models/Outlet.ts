import { Schema, model, Document, Types } from 'mongoose';

export interface IOutlet extends Document {
  organizationId: Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isDefault: boolean;
  activeStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const outletSchema = new Schema<IOutlet>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    activeStatus: { type: Boolean, default: true }
  },
  { timestamps: true }
);

outletSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export const Outlet = model<IOutlet>('Outlet', outletSchema);
