import { z } from 'zod';
import { OrderType, PaymentMethod } from '../constants/enums';

export const createOrderSchema = z.object({
  type: z.nativeEnum(OrderType).default(OrderType.RETAIL_SALE),
  tableId: z.string().optional(),
  tableNumber: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID required'),
    productName: z.string().min(1),
    unitPrice: z.number().min(0),
    quantity: z.number().min(1),
    taxRate: z.number().default(0),
    selectedModifiers: z.array(z.object({
      name: z.string(),
      price: z.number()
    })).optional().default([]),
    itemTotal: z.number().min(0)
  })).min(1, 'Order must contain at least 1 item'),
  subtotal: z.number().min(0),
  taxTotal: z.number().default(0),
  discountTotal: z.number().default(0),
  grandTotal: z.number().min(0),
  notes: z.string().optional()
});

export const checkoutInvoiceSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentDetails: z.array(z.object({
    method: z.nativeEnum(PaymentMethod),
    amount: z.number().min(0),
    transactionRef: z.string().optional()
  })).min(1, 'At least 1 payment method required')
});
