"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    avatarUrl: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: true }
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
