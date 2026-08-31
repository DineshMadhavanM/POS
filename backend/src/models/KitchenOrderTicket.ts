import { Schema, model, Document, Types } from 'mongoose';
import { KOTStatus } from '../constants/enums';

export interface IKOTItem {
  productName: string;
  quantity: number;
  unitPrice?: number;
  itemTotal?: number;
  selectedModifiers?: { name: string; price: number }[];
  specialInstructions?: string;
}

export interface IKitchenOrderTicket extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  orderNumber: string;
  tableNumber?: string;
  items: IKOTItem[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  status: KOTStatus;
  createdAt: Date;
  updatedAt: Date;
}

const kitchenOrderTicketSchema = new Schema<IKitchenOrderTicket>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
    orderNumber: { type: String, required: true },
    tableNumber: { type: String, default: 'N/A' },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    items: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, default: 0 },
        itemTotal: { type: Number, default: 0 },
        selectedModifiers: [
          {
            name: { type: String },
            price: { type: Number }
          }
        ],
        specialInstructions: { type: String, default: '' }
      }
    ],
    status: { type: String, enum: Object.values(KOTStatus), default: KOTStatus.PENDING }
  },
  { timestamps: true }
);

kitchenOrderTicketSchema.index({ organizationId: 1, status: 1 });

export const KitchenOrderTicket = model<IKitchenOrderTicket>('KitchenOrderTicket', kitchenOrderTicketSchema);
