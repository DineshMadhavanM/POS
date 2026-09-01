"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovement = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const stockMovementSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Outlet', index: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: Object.values(enums_1.StockMovementType), required: true },
    quantityDelta: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
stockMovementSchema.index({ organizationId: 1, productId: 1 });
exports.StockMovement = (0, mongoose_1.model)('StockMovement', stockMovementSchema);
