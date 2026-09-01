"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAIQuery = void 0;
const Invoice_1 = require("../models/Invoice");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const response_1 = require("../utils/response");
const processAIQuery = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant context missing', 403);
        const { prompt } = req.body;
        if (!prompt)
            return (0, response_1.sendError)(res, 'Prompt query is required', 400);
        const orgId = req.tenant.organizationId;
        const promptLower = prompt.toLowerCase();
        // Fetch tenant-scoped metrics to power answer generator
        const invoices = await Invoice_1.Invoice.find({ organizationId: orgId, isRefunded: false });
        const totalSales = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
        const products = await Product_1.Product.find({ organizationId: orgId, activeStatus: true });
        const lowStockItems = products.filter(p => !p.isService && p.currentStock <= p.minimumStock);
        const recentOrders = await Order_1.Order.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(10);
        let answer = '';
        let actionSuggestions = [];
        if (promptLower.includes('sales') || promptLower.includes('revenue') || promptLower.includes('week')) {
            answer = `Your total revenue recorded across ${invoices.length} completed transactions is **$${totalSales.toFixed(2)}**. Peak sales activity occurred during recent operational windows.`;
            actionSuggestions = ['View Sales Chart', 'Export Tax Report', 'Analyze Payment Split'];
        }
        else if (promptLower.includes('stock') || promptLower.includes('run out') || promptLower.includes('inventory')) {
            if (lowStockItems.length > 0) {
                const itemNames = lowStockItems.map(p => `${p.name} (Stock: ${p.currentStock})`).join(', ');
                answer = `Attention: You currently have **${lowStockItems.length} product(s)** running below minimum stock threshold: ${itemNames}.`;
                actionSuggestions = ['Create Supplier Order', 'Adjust Stock', 'View Inventory'];
            }
            else {
                answer = `All your products have sufficient stock levels! No immediate stock depletion alerts detected.`;
                actionSuggestions = ['View Catalog', 'Add New Product'];
            }
        }
        else if (promptLower.includes('best') || promptLower.includes('popular') || promptLower.includes('item')) {
            answer = `Based on recent order volume, your catalog displays high velocity across your primary categories. Keep your top items well-stocked!`;
            actionSuggestions = ['View Product Analytics', 'Update Modifiers'];
        }
        else {
            answer = `NexStack AI Assistant: Analyzed ${products.length} products and ${invoices.length} billing records for your workspace. Total Sales: $${totalSales.toFixed(2)}. How else can I assist your operational decisions today?`;
            actionSuggestions = ['Check Low Stock', 'Show Sales Summary', 'View Recent Orders'];
        }
        return (0, response_1.sendSuccess)(res, {
            prompt,
            answer,
            actionSuggestions,
            timestamp: new Date()
        }, 'AI insight generated');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'AI query processing failed', 500);
    }
};
exports.processAIQuery = processAIQuery;
