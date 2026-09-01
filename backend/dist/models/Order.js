"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
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
const orderSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Outlet', index: true },
    orderNumber: { type: String, required: true },
    type: { type: String, enum: Object.values(enums_1.OrderType), default: enums_1.OrderType.RETAIL_SALE },
    tableId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Table' },
    tableNumber: { type: String, default: '' },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    status: { type: String, enum: Object.values(enums_1.OrderStatus), default: enums_1.OrderStatus.PENDING },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, default: 0, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: Object.values(enums_1.PaymentStatus), default: enums_1.PaymentStatus.UNPAID },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
orderSchema.index({ organizationId: 1, orderNumber: 1 });
orderSchema.index({ organizationId: 1, createdAt: -1 });
exports.Order = (0, mongoose_1.model)('Order', orderSchema);
