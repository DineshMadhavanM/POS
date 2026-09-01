"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutInvoiceSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../constants/enums");
exports.createOrderSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(enums_1.OrderType).default(enums_1.OrderType.RETAIL_SALE),
    tableId: zod_1.z.string().optional(),
    tableNumber: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    customerName: zod_1.z.string().optional(),
    customerPhone: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID required'),
        productName: zod_1.z.string().min(1),
        unitPrice: zod_1.z.number().min(0),
        quantity: zod_1.z.number().min(1),
        taxRate: zod_1.z.number().default(0),
        selectedModifiers: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            price: zod_1.z.number()
        })).optional().default([]),
        itemTotal: zod_1.z.number().min(0)
    })).min(1, 'Order must contain at least 1 item'),
    subtotal: zod_1.z.number().min(0),
    taxTotal: zod_1.z.number().default(0),
    discountTotal: zod_1.z.number().default(0),
    grandTotal: zod_1.z.number().min(0),
    notes: zod_1.z.string().optional()
});
exports.checkoutInvoiceSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    paymentDetails: zod_1.z.array(zod_1.z.object({
        method: zod_1.z.nativeEnum(enums_1.PaymentMethod),
        amount: zod_1.z.number().min(0),
        transactionRef: zod_1.z.string().optional()
    })).min(1, 'At least 1 payment method required')
});
