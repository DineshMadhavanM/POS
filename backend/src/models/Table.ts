import { Schema, model, Document, Types } from 'mongoose';
import { TableStatus } from '../constants/enums';

export interface ITable extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, default: 4, min: 1 },
    status: { type: String, enum: Object.values(TableStatus), default: TableStatus.AVAILABLE },
    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' }
  },
  { timestamps: true }
);

tableSchema.index({ organizationId: 1, tableNumber: 1 }, { unique: true });

export const Table = model<ITable>('Table', tableSchema);
