import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(3, 'Phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional()
});

export const getCustomers = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { search, phone } = req.query;
    const filter: any = { organizationId: req.tenant.organizationId };

    if (phone) filter.phoneNumber = phone;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ name: 1 });
    return sendSuccess(res, customers, 'Customers retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch customers', 500);
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = customerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const existing = await Customer.findOne({
      organizationId: req.tenant.organizationId,
      phoneNumber: parseResult.data.phoneNumber
    });

    if (existing) {
      return sendSuccess(res, existing, 'Customer already exists');
    }

    const customer = await Customer.create({
      ...parseResult.data,
      organizationId: req.tenant.organizationId
    });

    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create customer', 500);
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const customer = await Customer.findOne({ _id: id, organizationId: req.tenant.organizationId });
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    const orders = await Order.find({ customerId: id, organizationId: req.tenant.organizationId }).sort({ createdAt: -1 });

    return sendSuccess(res, { customer, orders }, 'Customer profile and history loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch customer profile', 500);
  }
};
