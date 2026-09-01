"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpVerification = void 0;
const mongoose_1 = require("mongoose");
const otpVerificationSchema = new mongoose_1.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-expires after 10 minutes (600 seconds)
}, { timestamps: false });
exports.OtpVerification = (0, mongoose_1.model)('OtpVerification', otpVerificationSchema);
