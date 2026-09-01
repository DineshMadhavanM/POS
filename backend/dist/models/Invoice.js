"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const invoiceSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Outlet', index: true },
    invoiceNumber: { type: String, required: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentDetails: [
        {
            method: { type: String, enum: Object.values(enums_1.PaymentMethod), required: true },
            amount: { type: Number, required: true },
            transactionRef: { type: String, default: '' }
        }
    ],
    isRefunded: { type: Boolean, default: false },
    refundReason: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });
invoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });
exports.Invoice = (0, mongoose_1.model)('Invoice', invoiceSchema);
