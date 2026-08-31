import { Schema, model, Document, Types } from 'mongoose';

export interface IRole extends Document {
  organizationId: Types.ObjectId;
  name: string;
  code: string; // OWNER, MANAGER, CASHIER, KITCHEN_STAFF, INVENTORY_STAFF, CUSTOM
  description?: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
    permissions: [{ type: String, required: true }]
  },
  { timestamps: true }
);

roleSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export const Role = model<IRole>('Role', roleSchema);
