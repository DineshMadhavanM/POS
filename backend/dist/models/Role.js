"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = require("mongoose");
const roleSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
    permissions: [{ type: String, required: true }]
}, { timestamps: true });
roleSchema.index({ organizationId: 1, code: 1 }, { unique: true });
exports.Role = (0, mongoose_1.model)('Role', roleSchema);
