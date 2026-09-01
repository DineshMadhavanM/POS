"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Outlet = void 0;
const mongoose_1 = require("mongoose");
const outletSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    activeStatus: { type: Boolean, default: true }
}, { timestamps: true });
outletSchema.index({ organizationId: 1, code: 1 }, { unique: true });
exports.Outlet = (0, mongoose_1.model)('Outlet', outletSchema);
