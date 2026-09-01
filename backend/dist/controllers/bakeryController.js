"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCakeOrderStatus = exports.createCustomCakeOrder = exports.getCustomCakeOrders = void 0;
const CustomCakeOrder_1 = require("../models/CustomCakeOrder");
const enums_1 = require("../constants/enums");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const cakeOrderSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1, 'Customer name required'),
    customerPhone: zod_1.z.string().min(3, 'Phone number required'),
    deliveryDateTime: zod_1.z.string(),
    cakeFlavour: zod_1.z.string().min(1, 'Flavour required'),
    cakeWeightKg: zod_1.z.number().min(0.5),
    customMessage: zod_1.z.string().optional(),
    customInstructions: zod_1.z.string().optional(),
    referenceImageUrl: zod_1.z.string().optional(),
    totalPrice: zod_1.z.number().min(0),
    advancePaid: zod_1.z.number().min(0).default(0)
});
const getCustomCakeOrders = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { status } = req.query;
        const filter = { organizationId: req.tenant.organizationId };
        if (status)
            filter.status = status;
        const orders = await CustomCakeOrder_1.CustomCakeOrder.find(filter).sort({ deliveryDateTime: 1 });
        return (0, response_1.sendSuccess)(res, orders, 'Custom cake orders loaded');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch cake orders', 500);
    }
};
exports.getCustomCakeOrders = getCustomCakeOrders;
const createCustomCakeOrder = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = cakeOrderSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const data = parseResult.data;
        const remainingBalance = Math.max(0, data.totalPrice - data.advancePaid);
        const cakeOrder = await CustomCakeOrder_1.CustomCakeOrder.create({
            ...data,
            deliveryDateTime: new Date(data.deliveryDateTime),
            remainingBalance,
            organizationId: req.tenant.organizationId,
            status: enums_1.CakeOrderStatus.RECEIVED
        });
        return (0, response_1.sendSuccess)(res, cakeOrder, 'Custom cake order registered', 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to create cake order', 500);
    }
};
exports.createCustomCakeOrder = createCustomCakeOrder;
const updateCakeOrderStatus = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const { status, additionalPayment } = req.body;
        const order = await CustomCakeOrder_1.CustomCakeOrder.findOne({ _id: id, organizationId: req.tenant.organizationId });
        if (!order)
            return (0, response_1.sendError)(res, 'Cake order not found', 404);
        if (status && Object.values(enums_1.CakeOrderStatus).includes(status)) {
            order.status = status;
        }
        if (additionalPayment && additionalPayment > 0) {
            order.advancePaid += additionalPayment;
            order.remainingBalance = Math.max(0, order.totalPrice - order.advancePaid);
        }
        await order.save();
        return (0, response_1.sendSuccess)(res, order, 'Cake order status updated');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to update cake order', 500);
    }
};
exports.updateCakeOrderStatus = updateCakeOrderStatus;
