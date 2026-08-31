import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { sendSuccess, sendError } from '../utils/response';
import { productSchema, categorySchema } from '../validators/productValidator';
import { logActivity } from '../utils/activityLogger';

// GET PRODUCTS
export const getProducts = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { categoryId, search, barcode, lowStock, activeOnly } = req.query;

    const filter: any = { organizationId: req.tenant.organizationId };

    if (categoryId) filter.categoryId = categoryId;
    if (barcode) filter.barcode = barcode;
    if (activeOnly !== 'false') filter.activeStatus = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Product.find(filter).populate('categoryId').sort({ name: 1 });

    let products = await query;

    if (lowStock === 'true') {
      products = products.filter(p => !p.isService && p.currentStock <= p.minimumStock);
    }

    return sendSuccess(res, products, 'Products retrieved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch products', 500);
  }
};

// CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const productData = { ...parseResult.data };
    if (!productData.categoryId) delete productData.categoryId;
    if (!productData.expiryDate) delete productData.expiryDate;

    const product = await Product.create({
      ...productData,
      organizationId: req.tenant.organizationId,
      outletId: req.tenant.outletId
    });

    await logActivity({
      organizationId: req.tenant.organizationId,
      outletId: req.tenant.outletId,
      userId: req.user?.userId,
      userName: req.user?.email,
      action: 'CREATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: product._id.toString(),
      newValue: product.toObject()
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (err: any) {
    console.error('[CreateProduct Error]', err);
    return sendError(res, err.message || 'Product creation failed', 500);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const parseResult = productSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const existingProduct = await Product.findOne({ _id: id, organizationId: req.tenant.organizationId });
    if (!existingProduct) {
      return sendError(res, 'Product not found or access denied', 404);
    }

    const updateData = { ...parseResult.data };
    if (updateData.categoryId === undefined || updateData.categoryId === '') delete updateData.categoryId;

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user?.userId,
      userName: req.user?.email,
      action: 'UPDATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      previousValue: existingProduct.toObject(),
      newValue: updated?.toObject()
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (err: any) {
    console.error('[UpdateProduct Error]', err);
    return sendError(res, err.message || 'Product update failed', 500);
  }
};

// DELETE / ARCHIVE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const product = await Product.findOne({ _id: id, organizationId: req.tenant.organizationId });
    if (!product) {
      return sendError(res, 'Product not found or access denied', 404);
    }

    product.activeStatus = false;
    await product.save();

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user?.userId,
      action: 'ARCHIVE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id
    });

    return sendSuccess(res, null, 'Product archived successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to archive product', 500);
  }
};

// CATEGORY MANAGEMENT
export const getCategories = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const categories = await Category.find({ organizationId: req.tenant.organizationId }).sort({ name: 1 });
    return sendSuccess(res, categories, 'Categories retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch categories', 500);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const category = await Category.create({
      ...parseResult.data,
      organizationId: req.tenant.organizationId
    });

    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Category creation failed', 500);
  }
};
