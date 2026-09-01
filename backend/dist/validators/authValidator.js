"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingSchema = exports.employeeLoginSchema = exports.refreshTokenSchema = exports.googleAuthSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../constants/enums");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(4, 'Password must be at least 4 characters'),
    phoneNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
    businessName: zod_1.z.string().min(2, 'Business name must be at least 2 characters'),
    businessType: zod_1.z.nativeEnum(enums_1.BusinessType)
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.googleAuthSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    name: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().optional()
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
exports.employeeLoginSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1, 'Company ID is required'),
    employeeId: zod_1.z.string().min(1, 'Employee ID is required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.onboardingSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(2, 'Business name required'),
    businessType: zod_1.z.nativeEnum(enums_1.BusinessType),
    phoneNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().optional().or(zod_1.z.literal('')),
    gstin: zod_1.z.string().optional().or(zod_1.z.literal('')),
    currency: zod_1.z.string().default('USD'),
    timezone: zod_1.z.string().default('UTC'),
    taxRateDefault: zod_1.z.number().min(0).max(100).default(5),
    invoicePrefix: zod_1.z.string().default('INV')
});
