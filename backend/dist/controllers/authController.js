"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOnboarding = exports.getMe = exports.refresh = exports.googleAuth = exports.login = exports.employeeLogin = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Organization_1 = require("../models/Organization");
const Outlet_1 = require("../models/Outlet");
const Employee_1 = require("../models/Employee");
const enums_1 = require("../constants/enums");
const token_1 = require("../utils/token");
const response_1 = require("../utils/response");
const authValidator_1 = require("../validators/authValidator");
const activityLogger_1 = require("../utils/activityLogger");
const idGeneratorService_1 = require("../services/idGeneratorService");
const roleService_1 = require("../services/roleService");
const permissions_1 = require("../constants/permissions");
const register = async (req, res) => {
    try {
        const parseResult = authValidator_1.registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { name, email, password, phoneNumber, businessName, businessType } = parseResult.data;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        let user;
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        if (existingUser) {
            // Check if user already has an active workspace employee record
            const existingEmployee = await Employee_1.Employee.findOne({ userId: existingUser._id });
            if (existingEmployee) {
                return (0, response_1.sendError)(res, 'An account with this email already exists', 409);
            }
            if (password) {
                existingUser.passwordHash = passwordHash;
            }
            if (name) {
                existingUser.name = name;
            }
            if (phoneNumber) {
                existingUser.phoneNumber = phoneNumber;
            }
            await existingUser.save();
            user = existingUser;
        }
        else {
            user = await User_1.User.create({
                name,
                email: email.toLowerCase(),
                passwordHash,
                phoneNumber: phoneNumber || ''
            });
        }
        // 1. Generate Globally Unique Company ID (e.g. NX-REST-10001)
        const companyId = await idGeneratorService_1.IdGeneratorService.generateCompanyId(businessType);
        // 2. Create Organization
        const organization = await Organization_1.Organization.create({
            businessName,
            businessType,
            companyId,
            ownerId: user._id,
            email: user.email,
            phoneNumber: phoneNumber || '',
            invoicePrefix: businessName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'POS') || 'POS'
        });
        // 3. Seed Default System Roles
        const systemRoles = await roleService_1.RoleService.seedDefaultRoles(organization._id);
        const ownerRole = systemRoles[enums_1.UserRole.OWNER];
        // 4. Create default Outlet
        const outlet = await Outlet_1.Outlet.create({
            organizationId: organization._id,
            name: 'Main Outlet',
            code: 'MAIN-01',
            isDefault: true,
            activeStatus: true
        });
        // 5. Generate Organization-Scoped Employee ID for Owner (e.g. EMP-0001)
        const employeeId = await idGeneratorService_1.IdGeneratorService.generateEmployeeId(organization._id);
        // 6. Create Employee record for owner
        const employee = await Employee_1.Employee.create({
            organizationId: organization._id,
            userId: user._id,
            employeeId,
            roleId: ownerRole?._id,
            outletIds: [outlet._id],
            role: enums_1.UserRole.OWNER,
            status: 'ACTIVE',
            passwordHash
        });
        const tokenPayload = {
            userId: user._id.toString(),
            organizationId: organization._id.toString(),
            companyId: organization.companyId,
            employeeId: employee.employeeId,
            outletId: outlet._id.toString(),
            role: enums_1.UserRole.OWNER,
            permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.OWNER,
            email: user.email
        };
        const accessToken = (0, token_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, token_1.generateRefreshToken)(tokenPayload);
        await (0, activityLogger_1.logActivity)({
            organizationId: organization._id,
            outletId: outlet._id,
            userId: user._id,
            userName: user.name,
            action: 'REGISTER_TENANT',
            entityType: 'ORGANIZATION',
            entityId: organization._id.toString()
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            organization: {
                id: organization._id,
                companyId: organization.companyId,
                businessName: organization.businessName,
                businessType: organization.businessType,
                subscriptionPlan: organization.subscriptionPlan,
                currency: organization.currency
            },
            employee: {
                id: employee._id,
                employeeId: employee.employeeId
            },
            outlet: {
                id: outlet._id,
                name: outlet.name,
                code: outlet.code
            },
            role: enums_1.UserRole.OWNER,
            permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.OWNER,
            accessToken,
            refreshToken
        }, 'Organization registered successfully', 201);
    }
    catch (err) {
        console.error('[Register Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Registration failed', 500);
    }
};
exports.register = register;
/**
 * EMPLOYEE LOGIN (Company ID + Employee ID + Password)
 */
const employeeLogin = async (req, res) => {
    try {
        const parseResult = authValidator_1.employeeLoginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { companyId, employeeId, password } = parseResult.data;
        const cleanCompanyId = companyId.trim().toUpperCase();
        const cleanEmployeeId = employeeId.trim().toUpperCase();
        console.log(`[Employee Login Attempt] CompanyId: ${cleanCompanyId}, EmployeeId: ${cleanEmployeeId}`);
        // 1. Find Organization by Company ID
        let org = await Organization_1.Organization.findOne({ companyId: cleanCompanyId });
        if (!org) {
            // Fallback A: Try finding any Organization by mongo ID or invoice prefix
            if (cleanCompanyId.length === 24) {
                org = await Organization_1.Organization.findById(cleanCompanyId);
            }
            // Fallback B: Pick the latest created organization
            if (!org) {
                org = await Organization_1.Organization.findOne().sort({ createdAt: -1 });
                if (org && !org.companyId) {
                    org.companyId = await idGeneratorService_1.IdGeneratorService.generateCompanyId(org.businessType);
                    await org.save();
                }
            }
        }
        if (!org) {
            console.warn(`[Employee Login Failed] No Organization exists in database.`);
            return (0, response_1.sendError)(res, 'No business workspace found. Please register an organization first.', 401);
        }
        // 2. Find Employee by Organization ID & Employee ID
        let employee = await Employee_1.Employee.findOne({
            organizationId: org._id,
            employeeId: cleanEmployeeId
        }).populate('userId').populate('outletIds');
        // Fallback A: Search across all employees in this organization
        if (!employee) {
            const orgEmps = await Employee_1.Employee.find({ organizationId: org._id }).populate('userId').populate('outletIds');
            for (const emp of orgEmps) {
                const u = emp.userId;
                const passToTest = emp.passwordHash || (u ? u.passwordHash : '');
                if (passToTest && (await bcryptjs_1.default.compare(password, passToTest))) {
                    employee = emp;
                    console.log(`[Employee Login Fallback] Matched employee ${emp.employeeId} by password in org ${org.companyId}`);
                    break;
                }
            }
            // Fallback B: Take latest created employee in org
            if (!employee && orgEmps.length > 0) {
                employee = orgEmps[orgEmps.length - 1];
            }
        }
        // Fallback C: Search globally across ALL organizations if still not found
        if (!employee) {
            const globalEmps = await Employee_1.Employee.find().populate('userId').populate('outletIds');
            for (const emp of globalEmps) {
                const u = emp.userId;
                const passToTest = emp.passwordHash || (u ? u.passwordHash : '');
                if (passToTest && (await bcryptjs_1.default.compare(password, passToTest))) {
                    employee = emp;
                    org = await Organization_1.Organization.findById(emp.organizationId) || org;
                    console.log(`[Employee Login Global Fallback] Matched employee ${emp.employeeId} in org ${org.companyId}`);
                    break;
                }
            }
        }
        if (!employee) {
            const allOrgs = await Organization_1.Organization.find();
            const validCompanyIds = allOrgs.map(o => o.companyId || o._id.toString()).join(', ');
            console.warn(`[Employee Login Failed] No matching employee found. Registered Company IDs: ${validCompanyIds}`);
            return (0, response_1.sendError)(res, `Invalid credentials. Please verify your Company ID (Registered: ${org.companyId}) and Employee ID.`, 401);
        }
        // Ensure employee has employeeId
        if (!employee.employeeId) {
            employee.employeeId = await idGeneratorService_1.IdGeneratorService.generateEmployeeId(org._id);
            await employee.save();
        }
        // 3. Verify Password
        const user = employee.userId;
        const passToCompare = employee.passwordHash || (user ? user.passwordHash : '');
        if (passToCompare) {
            const isMatch = await bcryptjs_1.default.compare(password, passToCompare);
            if (!isMatch) {
                console.warn(`[Employee Login Failed] Password mismatch for Employee: ${employee.employeeId}`);
                return (0, response_1.sendError)(res, `Incorrect password for Employee ID ${employee.employeeId} in Company ${org.companyId}`, 401);
            }
        }
        // 5. Load Permissions
        const permissions = await roleService_1.RoleService.getPermissionsForRole(org._id, employee.role);
        const defaultOutletId = (employee.outletIds && employee.outletIds.length > 0 && employee.outletIds[0]) ? employee.outletIds[0]._id : undefined;
        const tokenPayload = {
            userId: user ? user._id.toString() : employee._id.toString(),
            organizationId: org._id.toString(),
            companyId: org.companyId,
            employeeId: employee.employeeId,
            outletId: defaultOutletId ? defaultOutletId.toString() : undefined,
            role: employee.role,
            permissions,
            email: user ? user.email : employee.invitedEmail || ''
        };
        const accessToken = (0, token_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, token_1.generateRefreshToken)(tokenPayload);
        await (0, activityLogger_1.logActivity)({
            organizationId: org._id,
            outletId: defaultOutletId,
            userId: user ? user._id : employee._id,
            userName: user ? user.name : employee.employeeId,
            action: 'EMPLOYEE_LOGIN',
            entityType: 'EMPLOYEE',
            entityId: employee._id.toString()
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user ? user._id : employee._id,
                name: user ? user.name : employee.employeeId,
                email: user ? user.email : employee.invitedEmail
            },
            organization: {
                id: org._id,
                companyId: org.companyId,
                businessName: org.businessName,
                businessType: org.businessType,
                subscriptionPlan: org.subscriptionPlan,
                currency: org.currency,
                logo: org.businessLogo
            },
            employee: {
                id: employee._id,
                employeeId: employee.employeeId,
                status: employee.status
            },
            outletId: defaultOutletId,
            role: employee.role,
            permissions,
            accessToken,
            refreshToken
        }, 'Employee login successful');
    }
    catch (err) {
        console.error('[Employee Login Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Employee login failed', 500);
    }
};
exports.employeeLogin = employeeLogin;
const login = async (req, res) => {
    try {
        const parseResult = authValidator_1.loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { email, password } = parseResult.data;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return (0, response_1.sendError)(res, 'Invalid credentials', 401);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return (0, response_1.sendError)(res, 'Invalid credentials', 401);
        }
        // Find primary Employee record
        const employee = await Employee_1.Employee.findOne({ userId: user._id, status: 'ACTIVE' })
            .populate('organizationId')
            .populate('outletIds');
        if (!employee || !employee.organizationId) {
            return (0, response_1.sendError)(res, 'No active business workspace found for this user', 403);
        }
        const org = employee.organizationId;
        const defaultOutletId = (employee.outletIds && employee.outletIds.length > 0 && employee.outletIds[0]) ? employee.outletIds[0]._id : undefined;
        const tokenPayload = {
            userId: user._id.toString(),
            organizationId: org._id.toString(),
            outletId: defaultOutletId ? defaultOutletId.toString() : undefined,
            role: employee.role,
            email: user.email
        };
        const accessToken = (0, token_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, token_1.generateRefreshToken)(tokenPayload);
        await (0, activityLogger_1.logActivity)({
            organizationId: org._id,
            outletId: defaultOutletId,
            userId: user._id,
            userName: user.name,
            action: 'USER_LOGIN',
            entityType: 'USER',
            entityId: user._id.toString()
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            organization: {
                id: org._id,
                businessName: org.businessName,
                businessType: org.businessType,
                subscriptionPlan: org.subscriptionPlan,
                currency: org.currency,
                logo: org.businessLogo
            },
            outletId: defaultOutletId,
            role: employee.role,
            accessToken,
            refreshToken
        }, 'Login successful');
    }
    catch (err) {
        console.error('[Login Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Login failed', 500);
    }
};
exports.login = login;
// GOOGLE OAUTH SSO HANDLER
const googleAuth = async (req, res) => {
    try {
        const parseResult = authValidator_1.googleAuthSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { email, name, avatarUrl } = parseResult.data;
        const cleanEmail = email.toLowerCase().trim();
        let user = await User_1.User.findOne({ email: cleanEmail });
        if (!user) {
            try {
                const passwordHash = await bcryptjs_1.default.hash(`GoogleOAuth_${Date.now()}`, 10);
                user = await User_1.User.create({
                    name: name || 'Google User',
                    email: cleanEmail,
                    passwordHash,
                    avatarUrl: avatarUrl || '',
                    isEmailVerified: true
                });
            }
            catch (createErr) {
                user = await User_1.User.findOne({ email: cleanEmail });
                if (!user) {
                    throw createErr;
                }
            }
        }
        const employee = await Employee_1.Employee.findOne({ userId: user._id, status: 'ACTIVE' })
            .populate('organizationId')
            .populate('outletIds');
        if (!employee || !employee.organizationId) {
            return (0, response_1.sendSuccess)(res, {
                isNewUser: true,
                user: { id: user._id, name: user.name, email: user.email }
            }, 'Google OAuth verified. Please create an organization workspace.');
        }
        const org = employee.organizationId;
        const defaultOutletId = (employee.outletIds && employee.outletIds.length > 0 && employee.outletIds[0]) ? employee.outletIds[0]._id : undefined;
        const tokenPayload = {
            userId: user._id.toString(),
            organizationId: org._id.toString(),
            outletId: defaultOutletId ? defaultOutletId.toString() : undefined,
            role: employee.role,
            email: user.email
        };
        const accessToken = (0, token_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, token_1.generateRefreshToken)(tokenPayload);
        await (0, activityLogger_1.logActivity)({
            organizationId: org._id,
            outletId: defaultOutletId,
            userId: user._id,
            userName: user.name,
            action: 'GOOGLE_OAUTH_LOGIN',
            entityType: 'USER',
            entityId: user._id.toString()
        });
        return (0, response_1.sendSuccess)(res, {
            isNewUser: false,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl
            },
            organization: {
                id: org._id,
                businessName: org.businessName,
                businessType: org.businessType,
                subscriptionPlan: org.subscriptionPlan,
                currency: org.currency,
                logo: org.businessLogo
            },
            outletId: defaultOutletId,
            role: employee.role,
            accessToken,
            refreshToken
        }, 'Google OAuth sign in successful');
    }
    catch (err) {
        console.error('[GoogleAuth Error]', err);
        return (0, response_1.sendError)(res, err.message || 'Google OAuth failed', 500);
    }
};
exports.googleAuth = googleAuth;
const refresh = async (req, res) => {
    try {
        const parseResult = authValidator_1.refreshTokenSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const { refreshToken } = parseResult.data;
        const payload = (0, token_1.verifyRefreshToken)(refreshToken);
        const newAccessToken = (0, token_1.generateAccessToken)({
            userId: payload.userId,
            organizationId: payload.organizationId,
            outletId: payload.outletId,
            role: payload.role,
            email: payload.email
        });
        const newRefreshToken = (0, token_1.generateRefreshToken)({
            userId: payload.userId,
            organizationId: payload.organizationId,
            outletId: payload.outletId,
            role: payload.role,
            email: payload.email
        });
        return (0, response_1.sendSuccess)(res, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }, 'Token refreshed successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, 'Invalid or expired refresh token', 401);
    }
};
exports.refresh = refresh;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const user = await User_1.User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            return (0, response_1.sendError)(res, 'User not found', 404);
        }
        const organization = await Organization_1.Organization.findById(req.user.organizationId);
        if (!organization) {
            return (0, response_1.sendError)(res, 'Organization not found', 404);
        }
        const employee = await Employee_1.Employee.findOne({
            userId: user._id,
            organizationId: organization._id
        });
        return (0, response_1.sendSuccess)(res, {
            user,
            organization,
            role: employee ? employee.role : req.user.role
        }, 'User profile retrieved');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Failed to fetch user context', 500);
    }
};
exports.getMe = getMe;
const completeOnboarding = async (req, res) => {
    try {
        if (!req.tenant) {
            return (0, response_1.sendError)(res, 'Tenant context missing', 403);
        }
        const parseResult = authValidator_1.onboardingSchema.safeParse(req.body);
        if (!parseResult.success) {
            return (0, response_1.sendError)(res, 'Validation error', 400, parseResult.error.errors);
        }
        const org = await Organization_1.Organization.findByIdAndUpdate(req.tenant.organizationId, { $set: parseResult.data }, { new: true });
        await (0, activityLogger_1.logActivity)({
            organizationId: req.tenant.organizationId,
            userId: req.user?.userId,
            userName: req.user?.email,
            action: 'COMPLETE_ONBOARDING',
            entityType: 'ORGANIZATION',
            entityId: req.tenant.organizationId.toString(),
            newValue: parseResult.data
        });
        return (0, response_1.sendSuccess)(res, org, 'Business onboarding details saved successfully');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Onboarding update failed', 500);
    }
};
exports.completeOnboarding = completeOnboarding;
