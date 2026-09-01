"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getOrders = exports.refundInvoice = exports.getInvoices = exports.checkoutInvoice = exports.createOrder = void 0;
const Order_1 = require("../models/Order");
const Invoice_1 = require("../models/Invoice");
const Product_1 = require("../models/Product");
const StockMovement_1 = require("../models/StockMovement");
const Customer_1 = require("../models/Customer");
const Organization_1 = require("../models/Organization");
const KitchenOrderTicket_1 = require("../models/KitchenOrderTicket");
const Table_1 = require("../models/Table");
const enums_1 = require("../constants/enums");
const response_1 = require("../utils/response");
const posValidator_1 = require("../validators/posValidator");
const activityLogger_1 = require("../utils/activityLogger");
// Helper to generate unique order and invoice numbers
const generateDocumentNumber = async (organizationId, prefix) => {
    const count = await Invoice_1.Invoice.countDocuments({ organizationId });
    const year = new Date().getFullYear();
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}-${sequence}`;
};
// CREATE DRAFT ORDER
const createOrder = async (req, res) => {
    try {
        if (!req.tenant || !req.user)
            return (0, response_1.sendError)(res, 'Tenant context missing', 403);
        const parseResult = posValidator_1.createOrderSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const org = await Organization_1.Organization.findById(req.tenant.organizationId);
        const prefix = org?.invoicePrefix || 'POS';
        const orderCount = await Order_1.Order.countDocuments({ organizationId: req.tenant.organizationId });
        const orderNumber = `ORD-${prefix}-${String(orderCount + 1).padStart(4, '0')}`;
        const orderData = parseResult.data;
        // Auto find or create customer record if customerName or customerPhone is provided
        let customerId = orderData.customerId;
        if (!customerId && (orderData.customerPhone || (orderData.customerName && orderData.customerName !== 'Walk-in Customer'))) {
            const phoneToFind = orderData.customerPhone || orderData.customerName;
            let customer = await Customer_1.Customer.findOne({
                organizationId: req.tenant.organizationId,
                $or: [
                    { phoneNumber: phoneToFind },
                    { name: orderData.customerName }
                ]
            });
            if (!customer) {
                customer = await Customer_1.Customer.create({
                    organizationId: req.tenant.organizationId,
                    name: orderData.customerName || 'Walk-in Customer',
                    phoneNumber: orderData.customerPhone || 'N/A',
                    totalPurchases: 0,
                    loyaltyPoints: 0
                });
            }
            customerId = customer._id.toString();
        }
        const order = await Order_1.Order.create({
            ...orderData,
            customerId,
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            orderNumber,
            createdBy: req.user.userId,
            status: enums_1.OrderStatus.PENDING,
            paymentStatus: enums_1.PaymentStatus.UNPAID
        });
        // Handle Table updates if TableId is passed
        if (orderData.tableId) {
            await Table_1.Table.findByIdAndUpdate(orderData.tableId, {
                status: enums_1.TableStatus.OCCUPIED,
                currentOrderId: order._id
            });
        }
        // Auto Create Kitchen Order Ticket (KOT) for Restaurant / Cafe
        if (org?.businessType === 'RESTAURANT' || org?.businessType === 'CAFE') {
            await KitchenOrderTicket_1.KitchenOrderTicket.create({
                organizationId: req.tenant.organizationId,
                outletId: req.tenant.outletId,
                orderId: order._id,
                orderNumber: order.orderNumber,
                tableNumber: order.tableNumber || 'N/A',
                items: order.items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    selectedModifiers: item.selectedModifiers,
                    specialInstructions: ''
                })),
                status: enums_1.KOTStatus.PENDING
            });
        }
        return (0, response_1.sendSuccess)(res, order, 'Order created successfully', 201);
    }
    catch (err) {
        console.error('[CreateOrder Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Order creation failed', 500);
    }
};
exports.createOrder = createOrder;
// CHECKOUT & GENERATE INVOICE
const checkoutInvoice = async (req, res) => {
    try {
        if (!req.tenant || !req.user)
            return (0, response_1.sendError)(res, 'Tenant context missing', 403);
        const parseResult = posValidator_1.checkoutInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { orderId, paymentDetails } = parseResult.data;
        const order = await Order_1.Order.findOne({ _id: orderId, organizationId: req.tenant.organizationId });
        if (!order) {
            return (0, response_1.sendError)(res, 'Order not found', 404);
        }
        if (order.paymentStatus === enums_1.PaymentStatus.PAID) {
            return (0, response_1.sendError)(res, 'Order has already been paid and invoiced', 400);
        }
        const org = await Organization_1.Organization.findById(req.tenant.organizationId);
        const prefix = org?.invoicePrefix || 'POS';
        const invoiceNumber = await generateDocumentNumber(req.tenant.organizationId, prefix);
        const totalPaid = paymentDetails.reduce((sum, p) => sum + p.amount, 0);
        const isFullPaid = totalPaid >= order.grandTotal;
        // Create Invoice
        const invoice = await Invoice_1.Invoice.create({
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            invoiceNumber,
            orderId: order._id,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            subtotal: order.subtotal,
            taxAmount: order.taxTotal,
            discountAmount: order.discountTotal,
            grandTotal: order.grandTotal,
            paymentDetails,
            issuedAt: new Date()
        });
        // Update Order Status
        order.paymentStatus = isFullPaid ? enums_1.PaymentStatus.PAID : enums_1.PaymentStatus.PARTIAL;
        order.status = enums_1.OrderStatus.COMPLETED;
        await order.save();
        // Mark associated KOT Tickets as SERVED so they automatically disappear from Current Orders screen
        await KitchenOrderTicket_1.KitchenOrderTicket.updateMany({
            organizationId: req.tenant.organizationId,
            $or: [
                { orderId: order._id },
                { orderNumber: order.orderNumber }
            ]
        }, { $set: { status: enums_1.KOTStatus.SERVED } });
        // Reset Table if attached or matched by tableNumber
        if (order.tableId) {
            await Table_1.Table.findByIdAndUpdate(order.tableId, {
                status: enums_1.TableStatus.AVAILABLE,
                currentOrderId: null
            });
        }
        else if (order.tableNumber) {
            await Table_1.Table.findOneAndUpdate({ organizationId: req.tenant.organizationId, tableNumber: order.tableNumber }, { status: enums_1.TableStatus.AVAILABLE, currentOrderId: null });
        }
        // Process Stock Deductions & Log Stock Movements
        for (const item of order.items) {
            const product = await Product_1.Product.findOne({ _id: item.productId, organizationId: req.tenant.organizationId });
            if (product && !product.isService) {
                const previousStock = product.currentStock;
                const newStock = previousStock - item.quantity;
                product.currentStock = newStock;
                await product.save();
                await StockMovement_1.StockMovement.create({
                    organizationId: req.tenant.organizationId,
                    outletId: req.tenant.outletId,
                    productId: product._id,
                    type: enums_1.StockMovementType.SALE,
                    quantityDelta: -item.quantity,
                    previousStock,
                    newStock,
                    referenceId: invoice.invoiceNumber,
                    notes: `POS Sale Invoice #${invoice.invoiceNumber}`,
                    createdBy: req.user.userId
                });
            }
        }
        // Award Loyalty Points & Update Customer Total Purchases
        let targetCustId = order.customerId;
        if (!targetCustId && (order.customerPhone || (order.customerName && order.customerName !== 'Walk-in Customer'))) {
            const phoneToFind = order.customerPhone || order.customerName;
            let cust = await Customer_1.Customer.findOne({
                organizationId: req.tenant.organizationId,
                $or: [
                    { phoneNumber: phoneToFind },
                    { name: order.customerName }
                ]
            });
            if (!cust) {
                cust = await Customer_1.Customer.create({
                    organizationId: req.tenant.organizationId,
                    name: order.customerName || 'Walk-in Customer',
                    phoneNumber: order.customerPhone || 'N/A',
                    totalPurchases: 0,
                    loyaltyPoints: 0
                });
            }
            targetCustId = cust._id.toString();
            order.customerId = cust._id;
            await order.save();
        }
        if (targetCustId) {
            const pointsEarned = Math.floor(order.grandTotal / 10);
            await Customer_1.Customer.findByIdAndUpdate(targetCustId, {
                $inc: { totalPurchases: order.grandTotal, loyaltyPoints: pointsEarned }
            });
        }
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            userId: req.user.userId,
            userName: req.user.email,
            action: 'POS_CHECKOUT',
            entityType: 'INVOICE',
            entityId: invoice._id.toString(),
            newValue: { invoiceNumber, grandTotal: order.grandTotal, totalPaid }
        });
        return (0, response_1.sendSuccess)(res, { invoice, order }, 'Invoice finalized and payment recorded successfully');
    }
    catch (err) {
        console.error('[CheckoutInvoice Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Checkout failed', 500);
    }
};
exports.checkoutInvoice = checkoutInvoice;
// GET INVOICES
const getInvoices = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { search, startDate, endDate } = req.query;
        const filter = { organizationId: req.tenant.organizationId };
        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerPhone: { $regex: search, $options: 'i' } }
            ];
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const invoices = await Invoice_1.Invoice.find(filter).populate('orderId').sort({ createdAt: -1 });
        return (0, response_1.sendSuccess)(res, invoices, 'Invoices retrieved successfully');
    }
    catch (err) {
        console.error('[GetInvoices Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch invoices', 500);
    }
};
exports.getInvoices = getInvoices;
// REFUND INVOICE
const refundInvoice = async (req, res) => {
    try {
        if (!req.tenant || !req.user)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const { reason } = req.body;
        const invoice = await Invoice_1.Invoice.findOne({ _id: id, organizationId: req.tenant.organizationId });
        if (!invoice)
            return (0, response_1.sendError)(res, 'Invoice not found', 404);
        if (invoice.isRefunded) {
            return (0, response_1.sendError)(res, 'Invoice is already refunded', 400);
        }
        invoice.isRefunded = true;
        invoice.refundReason = reason || 'Customer Refund';
        await invoice.save();
        // Restore stock
        const order = await Order_1.Order.findById(invoice.orderId);
        if (order) {
            for (const item of order.items) {
                const product = await Product_1.Product.findOne({ _id: item.productId, organizationId: req.tenant.organizationId });
                if (product && !product.isService) {
                    const previousStock = product.currentStock;
                    const newStock = previousStock + item.quantity;
                    product.currentStock = newStock;
                    await product.save();
                    await StockMovement_1.StockMovement.create({
                        organizationId: req.tenant.organizationId,
                        outletId: req.tenant.outletId,
                        productId: product._id,
                        type: enums_1.StockMovementType.RETURN,
                        quantityDelta: item.quantity,
                        previousStock,
                        newStock,
                        referenceId: invoice.invoiceNumber,
                        notes: `Refund for Invoice #${invoice.invoiceNumber}`,
                        createdBy: req.user.userId
                    });
                }
            }
        }
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user.userId,
            action: 'REFUND_INVOICE',
            entityType: 'INVOICE',
            entityId: id,
            newValue: { refundReason: invoice.refundReason }
        });
        return (0, response_1.sendSuccess)(res, invoice, 'Invoice refunded and stock restored');
    }
    catch (err) {
        console.error('[RefundInvoice Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Refund processing failed', 500);
    }
};
exports.refundInvoice = refundInvoice;
// GET ORDERS HISTORY
const getOrders = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { search, status, type } = req.query;
        const filter = { organizationId: req.tenant.organizationId };
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerPhone: { $regex: search, $options: 'i' } }
            ];
        }
        const orders = await Order_1.Order.find(filter).sort({ createdAt: -1 });
        // Calculate today's sequential order number (todayOrderNo)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
        const todayMap = new Map();
        todayOrders.reverse().forEach((ord, index) => {
            todayMap.set(ord._id.toString(), index + 1);
        });
        const formattedOrders = orders.map(ord => {
            const plainObj = ord.toObject();
            return {
                ...plainObj,
                todayOrderNo: todayMap.get(ord._id.toString()) || 1
            };
        });
        return (0, response_1.sendSuccess)(res, formattedOrders, 'Orders history retrieved successfully');
    }
    catch (err) {
        console.error('[GetOrders Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch orders history', 500);
    }
};
exports.getOrders = getOrders;
// DELETE ORDER
const deleteOrder = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const deleted = await Order_1.Order.findOneAndDelete({ _id: id, organizationId: req.tenant.organizationId });
        if (!deleted)
            return (0, response_1.sendError)(res, 'Order not found', 404);
        return (0, response_1.sendSuccess)(res, deleted, 'Order deleted successfully');
    }
    catch (err) {
        console.error('[DeleteOrder Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to delete order', 500);
    }
};
exports.deleteOrder = deleteOrder;
