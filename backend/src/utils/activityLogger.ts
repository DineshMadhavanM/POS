import { ActivityLog } from '../models/ActivityLog';
import { Types } from 'mongoose';

interface ILogOptions {
  organizationId: string | Types.ObjectId;
  outletId?: string | Types.ObjectId;
  userId?: string | Types.ObjectId;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
}

export const logActivity = async (opts: ILogOptions): Promise<void> => {
  try {
    await ActivityLog.create({
      organizationId: opts.organizationId,
      outletId: opts.outletId,
      userId: opts.userId,
      userName: opts.userName || 'System',
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId || '',
      previousValue: opts.previousValue,
      newValue: opts.newValue,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[ActivityLog Error]', err);
  }
};
