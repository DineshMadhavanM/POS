import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
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
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const invoices = await Invoice.find({
      organizationId: orgId,
      isRefunded: false,
      issuedAt: { $gte: startDate }
    }).sort({ issuedAt: 1 });

    const grouped: { [dateKey: string]: number } = {};
    const dateObjects: { [dateKey: string]: Date } = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      grouped[key] = 0;
      dateObjects[key] = d;
    }

    invoices.forEach(inv => {
      const key = new Date(inv.issuedAt).toISOString().split('T')[0];
      if (grouped[key] !== undefined) {
        grouped[key] += inv.grandTotal;
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const chartData = Object.keys(grouped).map(dateKey => {
      const d = dateObjects[dateKey];
      return {
        date: dateKey,
        day: dayNames[d.getDay()],
        sales: Number(grouped[dateKey].toFixed(2))
      };
    });

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
    let totalRevenue = 0;

    orders.forEach(ord => {
      ord.items.forEach(item => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = { quantity: 0, revenue: 0 };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].revenue += item.itemTotal;
        totalRevenue += item.itemTotal;
      });
    });

    const topProducts = Object.keys(productStats)
      .map(name => {
        const rev = productStats[name].revenue;
        const share = totalRevenue > 0 ? Number(((rev / totalRevenue) * 100).toFixed(1)) : 0;
        return {
          name,
          quantity: productStats[name].quantity,
          revenue: Number(rev.toFixed(2)),
          share
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return sendSuccess(res, topProducts, 'Top products report loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch top products', 500);
  }
};

export const getReportsSummary = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const orgId = req.tenant.organizationId;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Fetch Invoices
    const allInvoices = await Invoice.find({ organizationId: orgId, isRefunded: false });
    const todayInvoices = allInvoices.filter(inv => new Date(inv.issuedAt) >= startOfToday && new Date(inv.issuedAt) <= endOfToday);
    const monthInvoices = allInvoices.filter(inv => new Date(inv.issuedAt) >= startOfMonth);

    // Revenue totals
    const totalRevenue = Number(allInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toFixed(2));
    const todaySales = Number(todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toFixed(2));
    const monthlySales = Number(monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toFixed(2));

    // Completed orders
    const completedOrders = await Order.find({ organizationId: orgId, status: 'COMPLETED' });
    const totalOrders = completedOrders.length || allInvoices.length;
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    // Today's Payment breakdown (with all-time fallback if today has 0 payments)
    const targetInvoices = todayInvoices.length > 0 ? todayInvoices : allInvoices;
    const paymentBreakdown = {
      upi: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
      credit: { count: 0, total: 0, pending: 0 }
    };

    targetInvoices.forEach(inv => {
      inv.paymentDetails.forEach(pd => {
        const methodKey = (pd.method || '').toLowerCase();
        const amt = pd.amount || 0;

        if (methodKey.includes('upi') || methodKey === 'upi') {
          paymentBreakdown.upi.count += 1;
          paymentBreakdown.upi.total += amt;
        } else if (methodKey.includes('card') || methodKey === 'card') {
          paymentBreakdown.card.count += 1;
          paymentBreakdown.card.total += amt;
        } else if (methodKey.includes('cash') || methodKey === 'cash') {
          paymentBreakdown.cash.count += 1;
          paymentBreakdown.cash.total += amt;
        } else if (methodKey.includes('credit') || methodKey === 'credit') {
          paymentBreakdown.credit.count += 1;
          paymentBreakdown.credit.total += amt;
          paymentBreakdown.credit.pending += amt;
        } else {
          // Default to cash if unspecified
          paymentBreakdown.cash.count += 1;
          paymentBreakdown.cash.total += amt;
        }
      });
    });

    // Sales by Category
    const products = await Product.find({ organizationId: orgId });
    const categories = await Category.find({ organizationId: orgId });

    const prodCategoryMap: { [prodId: string]: { name: string; color: string } } = {};
    const catIdMap: { [catId: string]: { name: string; color: string } } = {};

    categories.forEach(cat => {
      catIdMap[cat._id.toString()] = {
        name: cat.name,
        color: cat.colorCode || '#84cc16'
      };
    });

    products.forEach(p => {
      if (p.categoryId && catIdMap[p.categoryId.toString()]) {
        prodCategoryMap[p._id.toString()] = catIdMap[p.categoryId.toString()];
      }
    });

    const categoryStats: { [catName: string]: { revenue: number; color: string } } = {};
    let totalCatRevenue = 0;

    completedOrders.forEach(ord => {
      ord.items.forEach(item => {
        const catInfo = prodCategoryMap[item.productId.toString()] || { name: 'Other', color: '#38bdf8' };
        if (!categoryStats[catInfo.name]) {
          categoryStats[catInfo.name] = { revenue: 0, color: catInfo.color };
        }
        categoryStats[catInfo.name].revenue += item.itemTotal;
        totalCatRevenue += item.itemTotal;
      });
    });

    const salesByCategory = Object.keys(categoryStats)
      .map(name => {
        const rev = categoryStats[name].revenue;
        const percentage = totalCatRevenue > 0 ? Number(((rev / totalCatRevenue) * 100).toFixed(1)) : 0;
        return {
          name,
          revenue: Number(rev.toFixed(2)),
          percentage,
          color: categoryStats[name].color
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    // Top Products with Share %
    const productStats: { [name: string]: { quantity: number; revenue: number } } = {};
    let totalProdRev = 0;

    completedOrders.forEach(ord => {
      ord.items.forEach(item => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = { quantity: 0, revenue: 0 };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].revenue += item.itemTotal;
        totalProdRev += item.itemTotal;
      });
    });

    const topProducts = Object.keys(productStats)
      .map(name => {
        const rev = productStats[name].revenue;
        const share = totalProdRev > 0 ? Number(((rev / totalProdRev) * 100).toFixed(1)) : 0;
        return {
          name,
          quantity: productStats[name].quantity,
          revenue: Number(rev.toFixed(2)),
          share
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return sendSuccess(res, {
      overview: {
        totalRevenue,
        todaySales,
        monthlySales,
        totalOrders,
        avgOrderValue,
        salesByCategory
      },
      payments: {
        todaySales,
        monthlySales,
        todayOrdersCount: todayInvoices.length,
        breakdown: {
          upi: { count: paymentBreakdown.upi.count, total: Number(paymentBreakdown.upi.total.toFixed(2)) },
          card: { count: paymentBreakdown.card.count, total: Number(paymentBreakdown.card.total.toFixed(2)) },
          cash: { count: paymentBreakdown.cash.count, total: Number(paymentBreakdown.cash.total.toFixed(2)) },
          credit: { count: paymentBreakdown.credit.count, total: Number(paymentBreakdown.credit.total.toFixed(2)), pending: Number(paymentBreakdown.credit.pending.toFixed(2)) }
        }
      },
      products: topProducts
    }, 'Reports summary loaded successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch reports summary', 500);
  }
};
