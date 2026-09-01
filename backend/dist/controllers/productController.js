"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const response_1 = require("../utils/response");
const productValidator_1 = require("../validators/productValidator");
const activityLogger_1 = require("../utils/activityLogger");
// GET PRODUCTS
const getProducts = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { categoryId, search, barcode, lowStock, activeOnly } = req.query;
        const filter = { organizationId: req.tenant.organizationId };
        if (categoryId)
            filter.categoryId = categoryId;
        if (barcode)
            filter.barcode = barcode;
        if (activeOnly !== 'false')
            filter.activeStatus = true;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }
        let query = Product_1.Product.find(filter).populate('categoryId').sort({ name: 1 });
        let products = await query;
        if (lowStock === 'true') {
            products = products.filter(p => !p.isService && p.currentStock <= p.minimumStock);
        }
        return (0, response_1.sendSuccess)(res, products, 'Products retrieved successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch products', 500);
    }
};
exports.getProducts = getProducts;
// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = productValidator_1.productSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const productData = { ...parseResult.data };
        if (!productData.categoryId)
            delete productData.categoryId;
        if (!productData.expiryDate)
            delete productData.expiryDate;
        const product = await Product_1.Product.create({
            ...productData,
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId
        });
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            userId: req.user?.userId,
            userName: req.user?.email,
            action: 'CREATE_PRODUCT',
            entityType: 'PRODUCT',
            entityId: product._id.toString(),
            newValue: product.toObject()
        });
        return (0, response_1.sendSuccess)(res, product, 'Product created successfully', 201);
    }
    catch (err) {
        console.error('[CreateProduct Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Product creation failed', 500);
    }
};
exports.createProduct = createProduct;
// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const parseResult = productValidator_1.productSchema.partial().safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const existingProduct = await Product_1.Product.findOne({ _id: id, organizationId: req.tenant.organizationId });
        if (!existingProduct) {
            return (0, response_1.sendError)(res, 'Product not found or access denied', 404);
        }
        const updateData = { ...parseResult.data };
        if (updateData.categoryId === undefined || updateData.categoryId === '')
            delete updateData.categoryId;
        const updated = await Product_1.Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user?.userId,
            userName: req.user?.email,
            action: 'UPDATE_PRODUCT',
            entityType: 'PRODUCT',
            entityId: id,
            previousValue: existingProduct.toObject(),
            newValue: updated?.toObject()
        });
        return (0, response_1.sendSuccess)(res, updated, 'Product updated successfully');
    }
    catch (err) {
        console.error('[UpdateProduct Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Product update failed', 500);
    }
};
exports.updateProduct = updateProduct;
// DELETE / ARCHIVE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const product = await Product_1.Product.findOne({ _id: id, organizationId: req.tenant.organizationId });
        if (!product) {
            return (0, response_1.sendError)(res, 'Product not found or access denied', 404);
        }
        product.activeStatus = false;
        await product.save();
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user?.userId,
            action: 'ARCHIVE_PRODUCT',
            entityType: 'PRODUCT',
            entityId: id
        });
        return (0, response_1.sendSuccess)(res, null, 'Product archived successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to archive product', 500);
    }
};
exports.deleteProduct = deleteProduct;
// CATEGORY MANAGEMENT
const getCategories = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const categories = await Category_1.Category.find({ organizationId: req.tenant.organizationId }).sort({ name: 1 });
        return (0, response_1.sendSuccess)(res, categories, 'Categories retrieved');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch categories', 500);
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = productValidator_1.categorySchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const category = await Category_1.Category.create({
            ...parseResult.data,
            organizationId: req.tenant.organizationId
        });
        return (0, response_1.sendSuccess)(res, category, 'Category created successfully', 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Category creation failed', 500);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const parseResult = productValidator_1.categorySchema.partial().safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const category = await Category_1.Category.findOneAndUpdate({ _id: id, organizationId: req.tenant.organizationId }, { $set: parseResult.data }, { new: true });
        if (!category)
            return (0, response_1.sendError)(res, 'Category not found', 404);
        return (0, response_1.sendSuccess)(res, category, 'Category updated successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Category update failed', 500);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const category = await Category_1.Category.findOneAndDelete({ _id: id, organizationId: req.tenant.organizationId });
        if (!category)
            return (0, response_1.sendError)(res, 'Category not found', 404);
        return (0, response_1.sendSuccess)(res, { id }, 'Category deleted successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Category deletion failed', 500);
    }
};
exports.deleteCategory = deleteCategory;
