"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const tableSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Outlet', index: true },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, default: 4, min: 1 },
    status: { type: String, enum: Object.values(enums_1.TableStatus), default: enums_1.TableStatus.AVAILABLE },
    currentOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });
tableSchema.index({ organizationId: 1, tableNumber: 1 }, { unique: true });
exports.Table = (0, mongoose_1.model)('Table', tableSchema);
