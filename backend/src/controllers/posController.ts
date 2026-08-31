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

    const order = await Order.create({
      ...orderData,
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

    // Reset Table if attached
    if (order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, {
        status: TableStatus.AVAILABLE,
        currentOrderId: null
      });
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

    // Award Loyalty Points to Customer
    if (order.customerId) {
      const pointsEarned = Math.floor(order.grandTotal / 10);
      await Customer.findByIdAndUpdate(order.customerId, {
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
