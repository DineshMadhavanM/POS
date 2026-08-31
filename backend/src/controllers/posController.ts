import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Invoice } from '../models/Invoice';
import { Product } from '../models/Product';
import { StockMovement } from '../models/StockMovement';
import { Customer } from '../models/Customer';
import { Organization } from '../models/Organization';
import { KitchenOrderTicket } from '../models/KitchenOrderTicket';
import { Table } from '../models/Table';
import { StockMovementType, PaymentStatus, OrderStatus, TableStatus, KOTStatus } from '../constants/enums';
import { sendSuccess, sendError } from '../utils/response';
import { createOrderSchema, checkoutInvoiceSchema } from '../validators/posValidator';
import { logActivity } from '../utils/activityLogger';

// Helper to generate unique order and invoice numbers
const generateDocumentNumber = async (organizationId: any, prefix: string): Promise<string> => {
  const count = await Invoice.countDocuments({ organizationId });
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${year}-${sequence}`;
};

// CREATE DRAFT ORDER
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.tenant || !req.user) return sendError(res, 'Tenant context missing', 403);

    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const org = await Organization.findById(req.tenant.organizationId);
    const prefix = org?.invoicePrefix || 'POS';

    const orderCount = await Order.countDocuments({ organizationId: req.tenant.organizationId });
    const orderNumber = `ORD-${prefix}-${String(orderCount + 1).padStart(4, '0')}`;

    const orderData = parseResult.data;

    // Auto find or create customer record if customerName or customerPhone is provided
    let customerId = orderData.customerId;
    if (!customerId && (orderData.customerPhone || (orderData.customerName && orderData.customerName !== 'Walk-in Customer'))) {
      const phoneToFind = orderData.customerPhone || orderData.customerName;
      let customer = await Customer.findOne({
        organizationId: req.tenant.organizationId,
        $or: [
          { phoneNumber: phoneToFind },
          { name: orderData.customerName }
        ]
      });

      if (!customer) {
        customer = await Customer.create({
          organizationId: req.tenant.organizationId,
          name: orderData.customerName || 'Walk-in Customer',
          phoneNumber: orderData.customerPhone || 'N/A',
          totalPurchases: 0,
          loyaltyPoints: 0
        });
      }
      customerId = customer._id.toString();
    }

    const order = await Order.create({
      ...orderData,
      customerId,
      organizationId: req.tenant.organizationId,
      outletId: req.tenant.outletId,
      orderNumber,
      createdBy: req.user.userId,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID
    });

    // Handle Table updates if TableId is passed
    if (orderData.tableId) {
      await Table.findByIdAndUpdate(orderData.tableId, {
        status: TableStatus.OCCUPIED,
        currentOrderId: order._id
      });
    }

    // Auto Create Kitchen Order Ticket (KOT) for Restaurant / Cafe
    if (org?.businessType === 'RESTAURANT' || org?.businessType === 'CAFE') {
      await KitchenOrderTicket.create({
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
        status: KOTStatus.PENDING
      });
    }

    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (err: any) {
    console.error('[CreateOrder Error]', err);
    return sendError(res, err.message || 'Order creation failed', 500);
  }
};

// CHECKOUT & GENERATE INVOICE
export const checkoutInvoice = async (req: Request, res: Response) => {
  try {
    if (!req.tenant || !req.user) return sendError(res, 'Tenant context missing', 403);

    const parseResult = checkoutInvoiceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { orderId, paymentDetails } = parseResult.data;

    const order = await Order.findOne({ _id: orderId, organizationId: req.tenant.organizationId });
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return sendError(res, 'Order has already been paid and invoiced', 400);
    }

    const org = await Organization.findById(req.tenant.organizationId);
    const prefix = org?.invoicePrefix || 'POS';
    const invoiceNumber = await generateDocumentNumber(req.tenant.organizationId, prefix);

    const totalPaid = paymentDetails.reduce((sum, p) => sum + p.amount, 0);
    const isFullPaid = totalPaid >= order.grandTotal;

    // Create Invoice
    const invoice = await Invoice.create({
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
    order.paymentStatus = isFullPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    order.status = OrderStatus.COMPLETED;
    await order.save();

    // Mark associated KOT Tickets as SERVED so they automatically disappear from Current Orders screen
    await KitchenOrderTicket.updateMany(
      {
        organizationId: req.tenant.organizationId,
        $or: [
          { orderId: order._id },
          { orderNumber: order.orderNumber }
        ]
      },
      { $set: { status: KOTStatus.SERVED } }
    );

    // Reset Table if attached or matched by tableNumber
    if (order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, {
        status: TableStatus.AVAILABLE,
        currentOrderId: null
      });
    } else if (order.tableNumber) {
      await Table.findOneAndUpdate(
        { organizationId: req.tenant.organizationId, tableNumber: order.tableNumber },
        { status: TableStatus.AVAILABLE, currentOrderId: null }
      );
    }

    // Process Stock Deductions & Log Stock Movements
    for (const item of order.items) {
      const product = await Product.findOne({ _id: item.productId, organizationId: req.tenant.organizationId });
      if (product && !product.isService) {
        const previousStock = product.currentStock;
        const newStock = previousStock - item.quantity;
        product.currentStock = newStock;
        await product.save();

        await StockMovement.create({
          organizationId: req.tenant.organizationId,
          outletId: req.tenant.outletId,
          productId: product._id,
          type: StockMovementType.SALE,
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
    let targetCustId: any = order.customerId;
    if (!targetCustId && (order.customerPhone || (order.customerName && order.customerName !== 'Walk-in Customer'))) {
      const phoneToFind = order.customerPhone || order.customerName;
      let cust = await Customer.findOne({
        organizationId: req.tenant.organizationId,
        $or: [
          { phoneNumber: phoneToFind },
          { name: order.customerName }
        ]
      });
      if (!cust) {
        cust = await Customer.create({
          organizationId: req.tenant.organizationId,
          name: order.customerName || 'Walk-in Customer',
          phoneNumber: order.customerPhone || 'N/A',
          totalPurchases: 0,
          loyaltyPoints: 0
        });
      }
      targetCustId = cust._id.toString();
      order.customerId = cust._id as any;
      await order.save();
    }

    if (targetCustId) {
      const pointsEarned = Math.floor(order.grandTotal / 10);
      await Customer.findByIdAndUpdate(targetCustId, {
        $inc: { totalPurchases: order.grandTotal, loyaltyPoints: pointsEarned }
      });
    }

    await logActivity({
      organizationId: req.tenant.organizationId,
      outletId: req.tenant.outletId,
      userId: req.user.userId,
      userName: req.user.email,
      action: 'POS_CHECKOUT',
      entityType: 'INVOICE',
      entityId: invoice._id.toString(),
      newValue: { invoiceNumber, grandTotal: order.grandTotal, totalPaid }
    });

    return sendSuccess(res, { invoice, order }, 'Invoice finalized and payment recorded successfully');
  } catch (err: any) {
    console.error('[CheckoutInvoice Error]', err);
    return sendError(res, err.message || 'Checkout failed', 500);
  }
};

// GET INVOICES
export const getInvoices = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { search, startDate, endDate } = req.query;
    const filter: any = { organizationId: req.tenant.organizationId };

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const invoices = await Invoice.find(filter).populate('orderId').sort({ createdAt: -1 });
    return sendSuccess(res, invoices, 'Invoices retrieved successfully');
  } catch (err: any) {
    console.error('[GetInvoices Error]', err);
    return sendError(res, err.message || 'Failed to fetch invoices', 500);
  }
};

// REFUND INVOICE
export const refundInvoice = async (req: Request, res: Response) => {
  try {
    if (!req.tenant || !req.user) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await Invoice.findOne({ _id: id, organizationId: req.tenant.organizationId });
    if (!invoice) return sendError(res, 'Invoice not found', 404);

    if (invoice.isRefunded) {
      return sendError(res, 'Invoice is already refunded', 400);
    }

    invoice.isRefunded = true;
    invoice.refundReason = reason || 'Customer Refund';
    await invoice.save();

    // Restore stock
    const order = await Order.findById(invoice.orderId);
    if (order) {
      for (const item of order.items) {
        const product = await Product.findOne({ _id: item.productId, organizationId: req.tenant.organizationId });
        if (product && !product.isService) {
          const previousStock = product.currentStock;
          const newStock = previousStock + item.quantity;
          product.currentStock = newStock;
          await product.save();

          await StockMovement.create({
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            productId: product._id,
            type: StockMovementType.RETURN,
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

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user.userId,
      action: 'REFUND_INVOICE',
      entityType: 'INVOICE',
      entityId: id,
      newValue: { refundReason: invoice.refundReason }
    });

    return sendSuccess(res, invoice, 'Invoice refunded and stock restored');
  } catch (err: any) {
    console.error('[RefundInvoice Error]', err);
    return sendError(res, err.message || 'Refund processing failed', 500);
  }
};

// GET ORDERS HISTORY
export const getOrders = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { search, status, type } = req.query;
    const filter: any = { organizationId: req.tenant.organizationId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Calculate today's sequential order number (todayOrderNo)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todayMap = new Map<string, number>();
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

    return sendSuccess(res, formattedOrders, 'Orders history retrieved successfully');
  } catch (err: any) {
    console.error('[GetOrders Error]', err);
    return sendError(res, err.message || 'Failed to fetch orders history', 500);
  }
};

// DELETE ORDER
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const deleted = await Order.findOneAndDelete({ _id: id, organizationId: req.tenant.organizationId });
    if (!deleted) return sendError(res, 'Order not found', 404);

    return sendSuccess(res, deleted, 'Order deleted successfully');
  } catch (err: any) {
    console.error('[DeleteOrder Error]', err);
    return sendError(res, err.message || 'Failed to delete order', 500);
  }
};
