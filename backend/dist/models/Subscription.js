"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../constants/enums");
const subscriptionSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    plan: { type: String, enum: Object.values(enums_1.SubscriptionPlan), required: true },
    status: { type: String, enum: Object.values(enums_1.SubscriptionStatus), required: true, default: enums_1.SubscriptionStatus.ACTIVE },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paymentHistory: [
        {
            amount: { type: Number, required: true },
            paymentDate: { type: Date, default: Date.now },
            paymentMethod: { type: String, default: 'CARD' },
            transactionId: { type: String, default: '' }
        }
    ]
}, { timestamps: true });
exports.Subscription = (0, mongoose_1.model)('Subscription', subscriptionSchema);
