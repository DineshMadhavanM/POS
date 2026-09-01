"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = require("mongoose");
const customerSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    address: { type: String, default: '' },
    totalPurchases: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 }
}, { timestamps: true });
customerSchema.index({ organizationId: 1, phoneNumber: 1 });
exports.Customer = (0, mongoose_1.model)('Customer', customerSchema);
