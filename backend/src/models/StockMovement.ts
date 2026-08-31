import { Schema, model, Document, Types } from 'mongoose';
import { StockMovementType } from '../constants/enums';

export interface IStockMovement extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  productId: Types.ObjectId;
  type: StockMovementType;
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  notes?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: Object.values(StockMovementType), required: true },
    quantityDelta: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

stockMovementSchema.index({ organizationId: 1, productId: 1 });

export const StockMovement = model<IStockMovement>('StockMovement', stockMovementSchema);
