import { Request, Response } from 'express';
import { CustomCakeOrder } from '../models/CustomCakeOrder';
import { CakeOrderStatus } from '../constants/enums';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const cakeOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name required'),
  customerPhone: z.string().min(3, 'Phone number required'),
  deliveryDateTime: z.string(),
  cakeFlavour: z.string().min(1, 'Flavour required'),
  cakeWeightKg: z.number().min(0.5),
  customMessage: z.string().optional(),
  customInstructions: z.string().optional(),
  referenceImageUrl: z.string().optional(),
  totalPrice: z.number().min(0),
  advancePaid: z.number().min(0).default(0)
});

export const getCustomCakeOrders = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { status } = req.query;
    const filter: any = { organizationId: req.tenant.organizationId };

    if (status) filter.status = status;

    const orders = await CustomCakeOrder.find(filter).sort({ deliveryDateTime: 1 });
    return sendSuccess(res, orders, 'Custom cake orders loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch cake orders', 500);
  }
};

export const createCustomCakeOrder = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = cakeOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const data = parseResult.data;
    const remainingBalance = Math.max(0, data.totalPrice - data.advancePaid);

    const cakeOrder = await CustomCakeOrder.create({
      ...data,
      deliveryDateTime: new Date(data.deliveryDateTime),
      remainingBalance,
      organizationId: req.tenant.organizationId,
      status: CakeOrderStatus.RECEIVED
    });

    return sendSuccess(res, cakeOrder, 'Custom cake order registered', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create cake order', 500);
  }
};

export const updateCakeOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const { status, additionalPayment } = req.body;

    const order = await CustomCakeOrder.findOne({ _id: id, organizationId: req.tenant.organizationId });
    if (!order) return sendError(res, 'Cake order not found', 404);

    if (status && Object.values(CakeOrderStatus).includes(status)) {
      order.status = status;
    }

    if (additionalPayment && additionalPayment > 0) {
      order.advancePaid += additionalPayment;
      order.remainingBalance = Math.max(0, order.totalPrice - order.advancePaid);
    }

    await order.save();
    return sendSuccess(res, order, 'Cake order status updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update cake order', 500);
  }
};
