"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerById = exports.createCustomer = exports.getCustomers = void 0;
const Customer_1 = require("../models/Customer");
const Order_1 = require("../models/Order");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    phoneNumber: zod_1.z.string().min(3, 'Phone number required'),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().optional()
});
const getCustomers = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { search, phone } = req.query;
        const filter = { organizationId: req.tenant.organizationId };
        if (phone)
            filter.phoneNumber = phone;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        const customers = await Customer_1.Customer.find(filter).sort({ name: 1 });
        return (0, response_1.sendSuccess)(res, customers, 'Customers retrieved');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch customers', 500);
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = customerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const existing = await Customer_1.Customer.findOne({
            organizationId: req.tenant.organizationId,
            phoneNumber: parseResult.data.phoneNumber
        });
        if (existing) {
            return (0, response_1.sendSuccess)(res, existing, 'Customer already exists');
        }
        const customer = await Customer_1.Customer.create({
            ...parseResult.data,
            organizationId: req.tenant.organizationId
        });
        return (0, response_1.sendSuccess)(res, customer, 'Customer created successfully', 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to create customer', 500);
    }
};
exports.createCustomer = createCustomer;
const getCustomerById = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const customer = await Customer_1.Customer.findOne({ _id: id, organizationId: req.tenant.organizationId });
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        const orders = await Order_1.Order.find({
            organizationId: req.tenant.organizationId,
            $or: [
                { customerId: id },
                { customerPhone: customer.phoneNumber },
                { customerName: customer.name }
            ]
        }).sort({ createdAt: -1 });
        return (0, response_1.sendSuccess)(res, { customer, orders }, 'Customer profile and history loaded');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch customer profile', 500);
    }
};
exports.getCustomerById = getCustomerById;
