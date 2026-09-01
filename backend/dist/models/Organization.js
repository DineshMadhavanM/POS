"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const organizationSchema = new mongoose_1.Schema({
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, enum: Object.values(enums_1.BusinessType), required: true, default: enums_1.BusinessType.RESTAURANT },
    companyId: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    businessLogo: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'UTC' },
    taxRateDefault: { type: Number, default: 5 },
    invoicePrefix: { type: String, default: 'INV' },
    subscriptionPlan: { type: String, enum: Object.values(enums_1.SubscriptionPlan), default: enums_1.SubscriptionPlan.FREE_TRIAL },
    subscriptionStatus: { type: String, enum: Object.values(enums_1.SubscriptionStatus), default: enums_1.SubscriptionStatus.ACTIVE }
}, { timestamps: true });
exports.Organization = (0, mongoose_1.model)('Organization', organizationSchema);
