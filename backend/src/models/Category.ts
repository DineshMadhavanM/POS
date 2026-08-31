import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  colorCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    colorCode: { type: String, default: '#3B82F6' }
  },
  { timestamps: true }
);

categorySchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
