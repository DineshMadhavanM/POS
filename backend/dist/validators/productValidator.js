"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = exports.productSchema = void 0;
const zod_1 = require("zod");
const optionalObjectId = zod_1.z.string().optional().or(zod_1.z.literal('')).transform(val => (val === '' || !val ? undefined : val));
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name is required'),
    sku: zod_1.z.string().optional(),
    barcode: zod_1.z.string().optional(),
    categoryId: optionalObjectId,
    description: zod_1.z.string().optional(),
    sellingPrice: zod_1.z.number().min(0, 'Selling price must be non-negative'),
    costPrice: zod_1.z.number().min(0).default(0),
    taxRate: zod_1.z.number().min(0).max(100).default(0),
    currentStock: zod_1.z.number().default(0),
    minimumStock: zod_1.z.number().default(5),
    isService: zod_1.z.boolean().default(false),
    productImage: zod_1.z.string().optional(),
    modifiers: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        price: zod_1.z.number().min(0)
    })).optional().default([]),
    batchNumber: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().optional().or(zod_1.z.literal('')).transform(val => (val === '' || !val ? undefined : val)),
    activeStatus: zod_1.z.boolean().default(true)
});
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    description: zod_1.z.string().optional(),
    colorCode: zod_1.z.string().optional()
});
