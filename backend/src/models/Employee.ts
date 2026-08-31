import { Schema, model, Document, Types } from 'mongoose';
import { UserRole } from '../constants/enums';

export interface IEmployee extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  employeeId: string;
  roleId?: Types.ObjectId;
  outletIds: Types.ObjectId[];
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'INVITED';
  passwordHash?: string;
  pinCodeHash?: string;
  invitedEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employeeId: { type: String, required: true, uppercase: true, trim: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', index: true },
    outletIds: [{ type: Schema.Types.ObjectId, ref: 'Outlet' }],
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.CASHIER },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'INVITED'], default: 'ACTIVE' },
    passwordHash: { type: String, default: '' },
    pinCodeHash: { type: String, default: '' },
    invitedEmail: { type: String, default: '' }
  },
  { timestamps: true }
);

employeeSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
employeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });

export const Employee = model<IEmployee>('Employee', employeeSchema);
