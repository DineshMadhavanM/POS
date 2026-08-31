import { Schema, model, Document, Types } from 'mongoose';

export interface IModifierOption {
  name: string;
  price: number;
}

export interface IProduct extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  name: string;
  sku: string;
  barcode: string;
  categoryId?: Types.ObjectId;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  currentStock: number;
  minimumStock: number;
  isService: boolean;
  productImage?: string;
  modifiers: IModifierOption[];
  batchNumber?: string;
  expiryDate?: Date;
  activeStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: '', trim: true },
    barcode: { type: String, default: '', trim: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    description: { type: String, default: '' },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    currentStock: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 5 },
    isService: { type: Boolean, default: false },
    productImage: { type: String, default: '' },
    modifiers: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 }
      }
    ],
    batchNumber: { type: String, default: '' },
    expiryDate: { type: Date },
    activeStatus: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ organizationId: 1, name: 1 });
productSchema.index({ organizationId: 1, barcode: 1 });
productSchema.index({ organizationId: 1, sku: 1 });

export const Product = model<IProduct>('Product', productSchema);
