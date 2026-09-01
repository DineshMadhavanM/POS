"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupplier = exports.getSuppliers = exports.getStockMovements = exports.adjustStock = void 0;
const Product_1 = require("../models/Product");
const StockMovement_1 = require("../models/StockMovement");
const Supplier_1 = require("../models/Supplier");
const enums_1 = require("../constants/enums");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const activityLogger_1 = require("../utils/activityLogger");
const adjustStockSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    type: zod_1.z.nativeEnum(enums_1.StockMovementType),
    quantityDelta: zod_1.z.number(),
    notes: zod_1.z.string().optional()
});
const supplierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Supplier name required'),
    contactPerson: zod_1.z.string().optional(),
    phone: zod_1.z.string().min(3, 'Phone number required'),
    email: zod_1.z.string().optional(),
    gstin: zod_1.z.string().optional(),
    address: zod_1.z.string().optional()
});
const adjustStock = async (req, res) => {
    try {
        if (!req.tenant || !req.user)
            return (0, response_1.sendError)(res, 'Tenant context missing', 403);
        const parseResult = adjustStockSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { productId, type, quantityDelta, notes } = parseResult.data;
        const product = await Product_1.Product.findOne({ _id: productId, organizationId: req.tenant.organizationId });
        if (!product)
            return (0, response_1.sendError)(res, 'Product not found', 404);
        const previousStock = product.currentStock;
        const newStock = previousStock + quantityDelta;
        product.currentStock = Math.max(0, newStock);
        await product.save();
        const movement = await StockMovement_1.StockMovement.create({
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            productId: product._id,
            type,
            quantityDelta,
            previousStock,
            newStock: product.currentStock,
            notes: notes || `Manual stock adjustment (${type})`,
            createdBy: req.user.userId
        });
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user.userId,
            action: 'STOCK_ADJUSTMENT',
            entityType: 'PRODUCT',
            entityId: product._id.toString(),
            newValue: { previousStock, newStock: product.currentStock, delta: quantityDelta, type }
        });
        return (0, response_1.sendSuccess)(res, { product, movement }, 'Stock updated successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Stock adjustment failed', 500);
    }
};
exports.adjustStock = adjustStock;
const getStockMovements = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const movements = await StockMovement_1.StockMovement.find({ organizationId: req.tenant.organizationId })
            .populate('productId', 'name sku barcode')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        return (0, response_1.sendSuccess)(res, movements, 'Stock movements retrieved');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch stock movements', 500);
    }
};
exports.getStockMovements = getStockMovements;
const getSuppliers = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const suppliers = await Supplier_1.Supplier.find({ organizationId: req.tenant.organizationId }).sort({ name: 1 });
        return (0, response_1.sendSuccess)(res, suppliers, 'Suppliers loaded');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch suppliers', 500);
    }
};
exports.getSuppliers = getSuppliers;
const createSupplier = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = supplierSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const supplier = await Supplier_1.Supplier.create({
            ...parseResult.data,
            organizationId: req.tenant.organizationId
        });
        return (0, response_1.sendSuccess)(res, supplier, 'Supplier created', 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to create supplier', 500);
    }
};
exports.createSupplier = createSupplier;
