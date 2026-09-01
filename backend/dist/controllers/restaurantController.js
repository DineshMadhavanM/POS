"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTable = exports.updateKOTStatus = exports.getKOTTickets = exports.createKOTTicket = exports.updateTableStatus = exports.createTable = exports.getTables = void 0;
const Table_1 = require("../models/Table");
const KitchenOrderTicket_1 = require("../models/KitchenOrderTicket");
const enums_1 = require("../constants/enums");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const tableSchema = zod_1.z.object({
    tableNumber: zod_1.z.string().min(1, 'Table number required'),
    capacity: zod_1.z.number().min(1).default(4)
});
const getTables = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const tables = await Table_1.Table.find({ organizationId: req.tenant.organizationId }).sort({ tableNumber: 1 });
        return (0, response_1.sendSuccess)(res, tables, 'Tables loaded');
    }
    catch (err) {
        console.error('[GetTables Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch tables', 500);
    }
};
exports.getTables = getTables;
const createTable = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = tableSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const table = await Table_1.Table.create({
            ...parseResult.data,
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            status: enums_1.TableStatus.AVAILABLE
        });
        return (0, response_1.sendSuccess)(res, table, 'Table created', 201);
    }
    catch (err) {
        console.error('[CreateTable Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to create table', 500);
    }
};
exports.createTable = createTable;
const updateTableStatus = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const { status } = req.body;
        const table = await Table_1.Table.findOneAndUpdate({ _id: id, organizationId: req.tenant.organizationId }, { $set: { status } }, { new: true });
        return (0, response_1.sendSuccess)(res, table, 'Table status updated');
    }
    catch (err) {
        console.error('[UpdateTableStatus Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to update table', 500);
    }
};
exports.updateTableStatus = updateTableStatus;
// KITCHEN DISPLAY SYSTEM (KDS) & CURRENT ORDERS
const kotSchema = zod_1.z.object({
    tableNumber: zod_1.z.string().min(1, 'Table number is required'),
    subtotal: zod_1.z.number().optional(),
    taxAmount: zod_1.z.number().optional(),
    totalAmount: zod_1.z.number().optional(),
    items: zod_1.z.array(zod_1.z.object({
        productName: zod_1.z.string(),
        quantity: zod_1.z.number().min(1),
        unitPrice: zod_1.z.number().optional(),
        itemTotal: zod_1.z.number().optional(),
        selectedModifiers: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), price: zod_1.z.number() })).optional(),
        specialInstructions: zod_1.z.string().optional()
    })).min(1, 'Order must contain at least 1 food item')
});
const createKOTTicket = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = kotSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { tableNumber, items, subtotal, taxAmount, totalAmount } = parseResult.data;
        const orderNumber = `KOT-${Math.floor(100000 + Math.random() * 900000)}`;
        const ticket = await KitchenOrderTicket_1.KitchenOrderTicket.create({
            organizationId: req.tenant.organizationId,
            outletId: req.tenant.outletId,
            orderNumber,
            tableNumber,
            items,
            subtotal: subtotal || 0,
            taxAmount: taxAmount || 0,
            totalAmount: totalAmount || 0,
            status: enums_1.KOTStatus.PENDING
        });
        // Automatically set table status to OCCUPIED if table exists
        await Table_1.Table.findOneAndUpdate({ organizationId: req.tenant.organizationId, tableNumber }, { status: enums_1.TableStatus.OCCUPIED });
        return (0, response_1.sendSuccess)(res, ticket, 'Kitchen Order Ticket sent to KDS successfully', 201);
    }
    catch (err) {
        console.error('[CreateKOTTicket Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to dispatch KOT ticket', 500);
    }
};
exports.createKOTTicket = createKOTTicket;
const getKOTTickets = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { status } = req.query;
        const filter = { organizationId: req.tenant.organizationId };
        if (status) {
            filter.status = status;
        }
        else {
            filter.status = { $nin: [enums_1.KOTStatus.SERVED, 'CANCELLED', 'COMPLETED', 'PAID'] };
        }
        const tickets = await KitchenOrderTicket_1.KitchenOrderTicket.find(filter).sort({ createdAt: -1 });
        return (0, response_1.sendSuccess)(res, tickets, 'KOT tickets loaded');
    }
    catch (err) {
        console.error('[GetKOTTickets Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch KOT tickets', 500);
    }
};
exports.getKOTTickets = getKOTTickets;
const updateKOTStatus = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const { status } = req.body;
        const ticket = await KitchenOrderTicket_1.KitchenOrderTicket.findOneAndUpdate({ _id: id, organizationId: req.tenant.organizationId }, { $set: { status } }, { new: true });
        if (ticket && (status === 'CANCELLED' || status === enums_1.KOTStatus.SERVED)) {
            // Free table when ticket is cancelled or served
            await Table_1.Table.findOneAndUpdate({ organizationId: req.tenant.organizationId, tableNumber: ticket.tableNumber }, { status: enums_1.TableStatus.AVAILABLE });
        }
        return (0, response_1.sendSuccess)(res, ticket, 'KOT status updated');
    }
    catch (err) {
        console.error('[UpdateKOTStatus Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to update KOT ticket', 500);
    }
};
exports.updateKOTStatus = updateKOTStatus;
const deleteTable = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const table = await Table_1.Table.findOneAndDelete({ _id: id, organizationId: req.tenant.organizationId });
        if (!table) {
            return (0, response_1.sendError)(res, 'Table not found', 404);
        }
        return (0, response_1.sendSuccess)(res, table, 'Table deleted successfully');
    }
    catch (err) {
        console.error('[DeleteTable Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to delete table', 500);
    }
};
exports.deleteTable = deleteTable;
