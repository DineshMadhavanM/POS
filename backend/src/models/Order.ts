import { Schema, model, Document, Types } from 'mongoose';
import { OrderType, OrderStatus, PaymentStatus } from '../constants/enums';

export interface IOrderItemEmbed {
  productId: Types.ObjectId;
  productName: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  selectedModifiers: { name: string; price: number }[];
  itemTotal: number;
}

export interface IOrder extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  orderNumber: string;
  type: OrderType;
  tableId?: Types.ObjectId;
  tableNumber?: string;
  customerId?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  items: IOrderItemEmbed[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItemEmbed>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  taxRate: { type: Number, default: 0 },
  selectedModifiers: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  itemTotal: { type: Number, required: true }
});

const orderSchema = new Schema<IOrder>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    orderNumber: { type: String, required: true },
    type: { type: String, enum: Object.values(OrderType), default: OrderType.RETAIL_SALE },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table' },
    tableNumber: { type: String, default: '' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, default: 0, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.UNPAID },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

orderSchema.index({ organizationId: 1, orderNumber: 1 });
orderSchema.index({ organizationId: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);
