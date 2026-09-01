"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenOrderTicket = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const kitchenOrderTicketSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Outlet', index: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: false },
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
    status: { type: String, enum: Object.values(enums_1.KOTStatus), default: enums_1.KOTStatus.PENDING }
}, { timestamps: true });
kitchenOrderTicketSchema.index({ organizationId: 1, status: 1 });
exports.KitchenOrderTicket = (0, mongoose_1.model)('KitchenOrderTicket', kitchenOrderTicketSchema);
