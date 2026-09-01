"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomCakeOrder = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const customCakeOrderSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryDateTime: { type: Date, required: true },
    cakeFlavour: { type: String, required: true },
    cakeWeightKg: { type: Number, required: true, min: 0.5 },
    customMessage: { type: String, default: '' },
    customInstructions: { type: String, default: '' },
    referenceImageUrl: { type: String, default: '' },
    totalPrice: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    remainingBalance: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(enums_1.CakeOrderStatus), default: enums_1.CakeOrderStatus.RECEIVED }
}, { timestamps: true });
customCakeOrderSchema.index({ organizationId: 1, deliveryDateTime: 1 });
exports.CustomCakeOrder = (0, mongoose_1.model)('CustomCakeOrder', customCakeOrderSchema);
