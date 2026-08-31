import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const orgId = req.tenant.organizationId;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Today's Sales & Orders
    const todayInvoices = await Invoice.find({
      organizationId: orgId,
      isRefunded: false,
      issuedAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const todayOrdersCount = todayInvoices.length;

    // Total All-Time Revenue
    const allInvoices = await Invoice.find({ organizationId: orgId, isRefunded: false });
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Low Stock Products Count
    const products = await Product.find({ organizationId: orgId, activeStatus: true, isService: false });
    const lowStockCount = products.filter(p => p.currentStock <= p.minimumStock).length;

    // Recent 5 Orders
    const recentOrders = await Order.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(5);

    return sendSuccess(res, {
      todaySales,
      todayOrdersCount,
      totalRevenue,
      lowStockCount,
      recentOrders
    }, 'Dashboard metrics retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch dashboard metrics', 500);
  }
};

export const getSalesChartData = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const orgId = req.tenant.organizationId;
    const days = parseInt(req.query.days as string) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const invoices = await Invoice.find({
      organizationId: orgId,
      isRefunded: false,
      issuedAt: { $gte: startDate }
    }).sort({ issuedAt: 1 });

    const grouped: { [dateKey: string]: number } = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      grouped[key] = 0;
    }

    invoices.forEach(inv => {
      const key = new Date(inv.issuedAt).toISOString().split('T')[0];
      if (grouped[key] !== undefined) {
        grouped[key] += inv.grandTotal;
      }
    });

    const chartData = Object.keys(grouped).map(date => ({
      date,
      sales: Number(grouped[date].toFixed(2))
    }));

    return sendSuccess(res, chartData, 'Sales chart data generated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch sales chart', 500);
  }
};

export const getTopProductsReport = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const orders = await Order.find({
      organizationId: req.tenant.organizationId,
      status: 'COMPLETED'
    });

    const productStats: { [name: string]: { quantity: number; revenue: number } } = {};

    orders.forEach(ord => {
      ord.items.forEach(item => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = { quantity: 0, revenue: 0 };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].revenue += item.itemTotal;
      });
    });

    const topProducts = Object.keys(productStats)
      .map(name => ({
        name,
        quantity: productStats[name].quantity,
        revenue: Number(productStats[name].revenue.toFixed(2))
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return sendSuccess(res, topProducts, 'Top products report loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch top products', 500);
  }
};
