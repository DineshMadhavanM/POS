import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';

export const processAIQuery = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant context missing', 403);

    const { prompt } = req.body;
    if (!prompt) return sendError(res, 'Prompt query is required', 400);

    const orgId = req.tenant.organizationId;
    const promptLower = prompt.toLowerCase();

    // Fetch tenant-scoped metrics to power answer generator
    const invoices = await Invoice.find({ organizationId: orgId, isRefunded: false });
    const totalSales = invoices.reduce((sum, i) => sum + i.grandTotal, 0);

    const products = await Product.find({ organizationId: orgId, activeStatus: true });
    const lowStockItems = products.filter(p => !p.isService && p.currentStock <= p.minimumStock);

    const recentOrders = await Order.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(10);

    let answer = '';
    let actionSuggestions: string[] = [];

    if (promptLower.includes('sales') || promptLower.includes('revenue') || promptLower.includes('week')) {
      answer = `Your total revenue recorded across ${invoices.length} completed transactions is **$${totalSales.toFixed(2)}**. Peak sales activity occurred during recent operational windows.`;
      actionSuggestions = ['View Sales Chart', 'Export Tax Report', 'Analyze Payment Split'];
    } else if (promptLower.includes('stock') || promptLower.includes('run out') || promptLower.includes('inventory')) {
      if (lowStockItems.length > 0) {
        const itemNames = lowStockItems.map(p => `${p.name} (Stock: ${p.currentStock})`).join(', ');
        answer = `Attention: You currently have **${lowStockItems.length} product(s)** running below minimum stock threshold: ${itemNames}.`;
        actionSuggestions = ['Create Supplier Order', 'Adjust Stock', 'View Inventory'];
      } else {
        answer = `All your products have sufficient stock levels! No immediate stock depletion alerts detected.`;
        actionSuggestions = ['View Catalog', 'Add New Product'];
      }
    } else if (promptLower.includes('best') || promptLower.includes('popular') || promptLower.includes('item')) {
      answer = `Based on recent order volume, your catalog displays high velocity across your primary categories. Keep your top items well-stocked!`;
      actionSuggestions = ['View Product Analytics', 'Update Modifiers'];
    } else {
      answer = `NexStack AI Assistant: Analyzed ${products.length} products and ${invoices.length} billing records for your workspace. Total Sales: $${totalSales.toFixed(2)}. How else can I assist your operational decisions today?`;
      actionSuggestions = ['Check Low Stock', 'Show Sales Summary', 'View Recent Orders'];
    }

    return sendSuccess(res, {
      prompt,
      answer,
      actionSuggestions,
      timestamp: new Date()
    }, 'AI insight generated');
  } catch (err: any) {
    return sendError(res, err.message || 'AI query processing failed', 500);
  }
};
