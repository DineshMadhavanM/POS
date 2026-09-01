"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supplier = void 0;
const mongoose_1 = require("mongoose");
const supplierSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    gstin: { type: String, default: '' },
    address: { type: String, default: '' }
}, { timestamps: true });
supplierSchema.index({ organizationId: 1, name: 1 });
exports.Supplier = (0, mongoose_1.model)('Supplier', supplierSchema);
