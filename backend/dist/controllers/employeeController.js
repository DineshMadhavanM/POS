"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeRole = exports.inviteEmployee = exports.getEmployees = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const Role_1 = require("../models/Role");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const activityLogger_1 = require("../utils/activityLogger");
const idGeneratorService_1 = require("../services/idGeneratorService");
const inviteEmployeeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Valid email required'),
    role: zod_1.z.string().min(1, 'Role is required'),
    password: zod_1.z.string().min(4, 'Password must be at least 4 characters').optional()
});
const getEmployees = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const employees = await Employee_1.Employee.find({ organizationId: req.tenant.organizationId })
            .populate('userId', 'name email phoneNumber avatarUrl')
            .populate('roleId')
            .sort({ createdAt: -1 });
        return (0, response_1.sendSuccess)(res, employees, 'Employees retrieved');
    }
    catch (err) {
        console.error('[GetEmployees Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch employees', 500);
    }
};
exports.getEmployees = getEmployees;
const inviteEmployee = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const parseResult = inviteEmployeeSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { name, email, role, password } = parseResult.data;
        const rawPassword = password || 'EmpPass2026!';
        const passwordHash = await bcryptjs_1.default.hash(rawPassword, 10);
        let user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User_1.User.create({
                name,
                email: email.toLowerCase(),
                passwordHash
            });
        }
        else {
            user.passwordHash = passwordHash;
            await user.save();
        }
        const existingEmp = await Employee_1.Employee.findOne({
            organizationId: req.tenant.organizationId,
            userId: user._id
        });
        if (existingEmp) {
            return (0, response_1.sendError)(res, 'User is already an employee of this organization', 400);
        }
        // Auto-generate Employee ID (e.g. EMP-0002)
        const employeeId = await idGeneratorService_1.IdGeneratorService.generateEmployeeId(req.tenant.organizationId);
        // Look up Role ID
        const roleDoc = await Role_1.Role.findOne({ organizationId: req.tenant.organizationId, code: role.toUpperCase() });
        const employee = await Employee_1.Employee.create({
            organizationId: req.tenant.organizationId,
            userId: user._id,
            employeeId,
            roleId: roleDoc?._id,
            outletIds: req.tenant.outletId ? [req.tenant.outletId] : [],
            role: role,
            status: 'ACTIVE',
            passwordHash
        });
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user?.userId,
            action: 'ADD_EMPLOYEE',
            entityType: 'EMPLOYEE',
            entityId: employee._id.toString(),
            newValue: { email, employeeId, role }
        });
        return (0, response_1.sendSuccess)(res, {
            ...employee.toObject(),
            generatedPassword: password ? undefined : rawPassword
        }, 'Employee added successfully', 201);
    }
    catch (err) {
        console.error('[AddEmployee Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to add employee', 500);
    }
};
exports.inviteEmployee = inviteEmployee;
const updateEmployeeRole = async (req, res) => {
    try {
        if (!req.tenant)
            return (0, response_1.sendError)(res, 'Tenant missing', 403);
        const { id } = req.params;
        const { role, status, password } = req.body;
        const employee = await Employee_1.Employee.findOne({ _id: id, organizationId: req.tenant.organizationId });
        if (!employee)
            return (0, response_1.sendError)(res, 'Employee record not found', 404);
        if (role) {
            const roleDoc = await Role_1.Role.findOne({ organizationId: req.tenant.organizationId, code: role.toUpperCase() });
            employee.role = role;
            if (roleDoc)
                employee.roleId = roleDoc._id;
        }
        if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            employee.status = status;
        }
        if (password) {
            const newHash = await bcryptjs_1.default.hash(password, 10);
            employee.passwordHash = newHash;
            await User_1.User.findByIdAndUpdate(employee.userId, { passwordHash: newHash });
        }
        await employee.save();
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user?.userId,
            action: 'UPDATE_EMPLOYEE_ROLE',
            entityType: 'EMPLOYEE',
            entityId: id,
            newValue: { role: employee.role, status: employee.status }
        });
        return (0, response_1.sendSuccess)(res, employee, 'Employee details updated successfully');
    }
    catch (err) {
        console.error('[UpdateEmployee Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Failed to update employee', 500);
    }
};
exports.updateEmployeeRole = updateEmployeeRole;
