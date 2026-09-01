"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    colorCode: { type: String, default: '#3B82F6' }
}, { timestamps: true });
categorySchema.index({ organizationId: 1, name: 1 }, { unique: true });
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
