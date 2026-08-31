import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { StockMovement } from '../models/StockMovement';
import { Supplier } from '../models/Supplier';
import { StockMovementType } from '../constants/enums';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';
import { logActivity } from '../utils/activityLogger';

const adjustStockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  type: z.nativeEnum(StockMovementType),
  quantityDelta: z.number(),
  notes: z.string().optional()
});

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name required'),
  contactPerson: z.string().optional(),
  phone: z.string().min(3, 'Phone number required'),
  email: z.string().optional(),
  gstin: z.string().optional(),
  address: z.string().optional()
});

export const adjustStock = async (req: Request, res: Response) => {
  try {
    if (!req.tenant || !req.user) return sendError(res, 'Tenant context missing', 403);

    const parseResult = adjustStockSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { productId, type, quantityDelta, notes } = parseResult.data;

    const product = await Product.findOne({ _id: productId, organizationId: req.tenant.organizationId });
    if (!product) return sendError(res, 'Product not found', 404);

    const previousStock = product.currentStock;
    const newStock = previousStock + quantityDelta;

    product.currentStock = Math.max(0, newStock);
    await product.save();

    const movement = await StockMovement.create({
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

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user.userId,
      action: 'STOCK_ADJUSTMENT',
      entityType: 'PRODUCT',
      entityId: product._id.toString(),
      newValue: { previousStock, newStock: product.currentStock, delta: quantityDelta, type }
    });

    return sendSuccess(res, { product, movement }, 'Stock updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Stock adjustment failed', 500);
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const movements = await StockMovement.find({ organizationId: req.tenant.organizationId })
      .populate('productId', 'name sku barcode')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, movements, 'Stock movements retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch stock movements', 500);
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const suppliers = await Supplier.find({ organizationId: req.tenant.organizationId }).sort({ name: 1 });
    return sendSuccess(res, suppliers, 'Suppliers loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch suppliers', 500);
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = supplierSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const supplier = await Supplier.create({
      ...parseResult.data,
      organizationId: req.tenant.organizationId
    });

    return sendSuccess(res, supplier, 'Supplier created', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create supplier', 500);
  }
};
