import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { Role } from '../models/Role';
import { UserRole } from '../constants/enums';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';
import { logActivity } from '../utils/activityLogger';
import { IdGeneratorService } from '../services/idGeneratorService';

const inviteEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  role: z.string().min(1, 'Role is required'),
  password: z.string().min(4, 'Password must be at least 4 characters').optional()
});

export const getEmployees = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const employees = await Employee.find({ organizationId: req.tenant.organizationId })
      .populate('userId', 'name email phoneNumber avatarUrl')
      .populate('roleId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, employees, 'Employees retrieved');
  } catch (err: any) {
    console.error('[GetEmployees Error]', err);
    return sendError(res, err.message || 'Failed to fetch employees', 500);
  }
};

export const inviteEmployee = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const parseResult = inviteEmployeeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { name, email, role, password } = parseResult.data;
    const rawPassword = password || 'EmpPass2026!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash
      });
    } else {
      user.passwordHash = passwordHash;
      await user.save();
    }

    const existingEmp = await Employee.findOne({
      organizationId: req.tenant.organizationId,
      userId: user._id
    });

    if (existingEmp) {
      return sendError(res, 'User is already an employee of this organization', 400);
    }

    // Auto-generate Employee ID (e.g. EMP-0002)
    const employeeId = await IdGeneratorService.generateEmployeeId(req.tenant.organizationId);

    // Look up Role ID
    const roleDoc = await Role.findOne({ organizationId: req.tenant.organizationId, code: role.toUpperCase() });

    const employee = await Employee.create({
      organizationId: req.tenant.organizationId,
      userId: user._id,
      employeeId,
      roleId: roleDoc?._id,
      outletIds: req.tenant.outletId ? [req.tenant.outletId] : [],
      role: role as UserRole,
      status: 'ACTIVE',
      passwordHash
    });

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user?.userId,
      action: 'ADD_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: employee._id.toString(),
      newValue: { email, employeeId, role }
    });

    return sendSuccess(res, {
      ...employee.toObject(),
      generatedPassword: password ? undefined : rawPassword
    }, 'Employee added successfully', 201);
  } catch (err: any) {
    console.error('[AddEmployee Error]', err);
    return sendError(res, err.message || 'Failed to add employee', 500);
  }
};

export const updateEmployeeRole = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) return sendError(res, 'Tenant missing', 403);

    const { id } = req.params;
    const { role, status, password } = req.body;

    const employee = await Employee.findOne({ _id: id, organizationId: req.tenant.organizationId });
    if (!employee) return sendError(res, 'Employee record not found', 404);

    if (role) {
      const roleDoc = await Role.findOne({ organizationId: req.tenant.organizationId, code: role.toUpperCase() });
      employee.role = role;
      if (roleDoc) employee.roleId = roleDoc._id;
    }

    if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      employee.status = status;
    }

    if (password) {
      const newHash = await bcrypt.hash(password, 10);
      employee.passwordHash = newHash;
      await User.findByIdAndUpdate(employee.userId, { passwordHash: newHash });
    }

    await employee.save();

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user?.userId,
      action: 'UPDATE_EMPLOYEE_ROLE',
      entityType: 'EMPLOYEE',
      entityId: id,
      newValue: { role: employee.role, status: employee.status }
    });

    return sendSuccess(res, employee, 'Employee details updated successfully');
  } catch (err: any) {
    console.error('[UpdateEmployee Error]', err);
    return sendError(res, err.message || 'Failed to update employee', 500);
  }
};
