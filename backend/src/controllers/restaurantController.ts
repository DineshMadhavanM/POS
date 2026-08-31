import { Request, Response } from 'express';
import { Table } from '../models/Table';
import { KitchenOrderTicket } from '../models/KitchenOrderTicket';
import { TableStatus, KOTStatus } from '../constants/enums';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const tableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number required'),
  capacity: z.number().min(1).default(4)
});

export const getTables = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const tables = await Table.find({ organizationId: req.tenant.organizationId }).sort({ tableNumber: 1 });
    return sendSuccess(res, tables, 'Tables loaded');
  } catch (err: any) {
    console.error('[GetTables Error]', err);
    return sendError(res, err.message || 'Failed to fetch tables', 500);
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = tableSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const table = await Table.create({
      ...parseResult.data,
      organizationId: req.tenant.organizationId,
      outletId: req.tenant.outletId,
      status: TableStatus.AVAILABLE
    });

    return sendSuccess(res, table, 'Table created', 201);
  } catch (err: any) {
    console.error('[CreateTable Error]', err);
    return sendError(res, err.message || 'Failed to create table', 500);
  }
};

export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const { status } = req.body;

    const table = await Table.findOneAndUpdate(
      { _id: id, organizationId: req.tenant.organizationId },
      { $set: { status } },
      { new: true }
    );

    return sendSuccess(res, table, 'Table status updated');
  } catch (err: any) {
    console.error('[UpdateTableStatus Error]', err);
    return sendError(res, err.message || 'Failed to update table', 500);
  }
};

// KITCHEN DISPLAY SYSTEM (KDS)
export const getKOTTickets = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { status } = req.query;
    const filter: any = { organizationId: req.tenant.organizationId };

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: KOTStatus.SERVED };
    }

    const tickets = await KitchenOrderTicket.find(filter).sort({ createdAt: 1 });
    return sendSuccess(res, tickets, 'KOT tickets loaded');
  } catch (err: any) {
    console.error('[GetKOTTickets Error]', err);
    return sendError(res, err.message || 'Failed to fetch KOT tickets', 500);
  }
};

export const updateKOTStatus = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const { status } = req.body;

    const ticket = await KitchenOrderTicket.findOneAndUpdate(
      { _id: id, organizationId: req.tenant.organizationId },
      { $set: { status } },
      { new: true }
    );

    return sendSuccess(res, ticket, 'KOT status updated');
  } catch (err: any) {
    console.error('[UpdateKOTStatus Error]', err);
    return sendError(res, err.message || 'Failed to update KOT ticket', 500);
  }
};
