import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  organizationId: Types.ObjectId;
  outletId?: Types.ObjectId;
  userId?: Types.ObjectId;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: '' },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

activityLogSchema.index({ organizationId: 1, timestamp: -1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
