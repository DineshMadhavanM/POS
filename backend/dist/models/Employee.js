"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const employeeSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employeeId: { type: String, required: true, uppercase: true, trim: true },
    roleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role', index: true },
    outletIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Outlet' }],
    role: { type: String, enum: Object.values(enums_1.UserRole), required: true, default: enums_1.UserRole.CASHIER },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'INVITED'], default: 'ACTIVE' },
    passwordHash: { type: String, default: '' },
    pinCodeHash: { type: String, default: '' },
    invitedEmail: { type: String, default: '' }
}, { timestamps: true });
employeeSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
employeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });
exports.Employee = (0, mongoose_1.model)('Employee', employeeSchema);
