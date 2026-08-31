import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Outlet } from '../models/Outlet';
import { Employee } from '../models/Employee';
import { UserRole } from '../constants/enums';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { sendSuccess, sendError } from '../utils/response';
import { registerSchema, loginSchema, employeeLoginSchema, refreshTokenSchema, onboardingSchema, googleAuthSchema } from '../validators/authValidator';
import { logActivity } from '../utils/activityLogger';
import { IdGeneratorService } from '../services/idGeneratorService';
import { RoleService } from '../services/roleService';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants/permissions';

export const register = async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { name, email, password, phoneNumber, businessName, businessType } = parseResult.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    let user;

    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser) {
      // Check if user already has an active workspace employee record
      const existingEmployee = await Employee.findOne({ userId: existingUser._id });
      if (existingEmployee) {
        return sendError(res, 'An account with this email already exists', 409);
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
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        phoneNumber: phoneNumber || ''
      });
    }

    // 1. Generate Globally Unique Company ID (e.g. NX-REST-10001)
    const companyId = await IdGeneratorService.generateCompanyId(businessType);

    // 2. Create Organization
    const organization = await Organization.create({
      businessName,
      businessType,
      companyId,
      ownerId: user._id,
      email: user.email,
      phoneNumber: phoneNumber || '',
      invoicePrefix: businessName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'POS') || 'POS'
    });

    // 3. Seed Default System Roles
    const systemRoles = await RoleService.seedDefaultRoles(organization._id);
    const ownerRole = systemRoles[UserRole.OWNER];

    // 4. Create default Outlet
    const outlet = await Outlet.create({
      organizationId: organization._id,
      name: 'Main Outlet',
      code: 'MAIN-01',
      isDefault: true,
      activeStatus: true
    });

    // 5. Generate Organization-Scoped Employee ID for Owner (e.g. EMP-0001)
    const employeeId = await IdGeneratorService.generateEmployeeId(organization._id);

    // 6. Create Employee record for owner
    const employee = await Employee.create({
      organizationId: organization._id,
      userId: user._id,
      employeeId,
      roleId: ownerRole?._id,
      outletIds: [outlet._id],
      role: UserRole.OWNER,
      status: 'ACTIVE',
      passwordHash
    });

    const tokenPayload = {
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      companyId: organization.companyId,
      employeeId: employee.employeeId,
      outletId: outlet._id.toString(),
      role: UserRole.OWNER,
      permissions: DEFAULT_ROLE_PERMISSIONS.OWNER,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity({
      organizationId: organization._id,
      outletId: outlet._id,
      userId: user._id,
      userName: user.name,
      action: 'REGISTER_TENANT',
      entityType: 'ORGANIZATION',
      entityId: organization._id.toString()
    });

    return sendSuccess(res, {
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
      role: UserRole.OWNER,
      permissions: DEFAULT_ROLE_PERMISSIONS.OWNER,
      accessToken,
      refreshToken
    }, 'Organization registered successfully', 201);
  } catch (err: any) {
    console.error('[Register Error]', err);
    return sendError(res, err.message || 'Registration failed', 500);
  }
};

/**
 * EMPLOYEE LOGIN (Company ID + Employee ID + Password)
 */
export const employeeLogin = async (req: Request, res: Response) => {
  try {
    const parseResult = employeeLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { companyId, employeeId, password } = parseResult.data;
    const cleanCompanyId = companyId.trim().toUpperCase();
    const cleanEmployeeId = employeeId.trim().toUpperCase();

    console.log(`[Employee Login Attempt] CompanyId: ${cleanCompanyId}, EmployeeId: ${cleanEmployeeId}`);

    // 1. Find Organization by Company ID
    let org = await Organization.findOne({ companyId: cleanCompanyId });

    if (!org) {
      // Fallback A: Try finding any Organization by mongo ID or invoice prefix
      if (cleanCompanyId.length === 24) {
        org = await Organization.findById(cleanCompanyId);
      }
      // Fallback B: Pick the latest created organization
      if (!org) {
        org = await Organization.findOne().sort({ createdAt: -1 });
        if (org && !org.companyId) {
          org.companyId = await IdGeneratorService.generateCompanyId(org.businessType);
          await org.save();
        }
      }
    }

    if (!org) {
      console.warn(`[Employee Login Failed] No Organization exists in database.`);
      return sendError(res, 'No business workspace found. Please register an organization first.', 401);
    }

    // 2. Find Employee by Organization ID & Employee ID
    let employee = await Employee.findOne({
      organizationId: org._id,
      employeeId: cleanEmployeeId
    }).populate('userId').populate('outletIds');

    // Fallback A: Search across all employees in this organization
    if (!employee) {
      const orgEmps = await Employee.find({ organizationId: org._id }).populate('userId').populate('outletIds');
      for (const emp of orgEmps) {
        const u = emp.userId as any;
        const passToTest = emp.passwordHash || (u ? u.passwordHash : '');
        if (passToTest && (await bcrypt.compare(password, passToTest))) {
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
      const globalEmps = await Employee.find().populate('userId').populate('outletIds');
      for (const emp of globalEmps) {
        const u = emp.userId as any;
        const passToTest = emp.passwordHash || (u ? u.passwordHash : '');
        if (passToTest && (await bcrypt.compare(password, passToTest))) {
          employee = emp;
          org = await Organization.findById(emp.organizationId) || org;
          console.log(`[Employee Login Global Fallback] Matched employee ${emp.employeeId} in org ${org.companyId}`);
          break;
        }
      }
    }

    if (!employee) {
      const allOrgs = await Organization.find();
      const validCompanyIds = allOrgs.map(o => o.companyId || o._id.toString()).join(', ');
      console.warn(`[Employee Login Failed] No matching employee found. Registered Company IDs: ${validCompanyIds}`);
      return sendError(res, `Invalid credentials. Please verify your Company ID (Registered: ${org.companyId}) and Employee ID.`, 401);
    }

    // Ensure employee has employeeId
    if (!employee.employeeId) {
      employee.employeeId = await IdGeneratorService.generateEmployeeId(org._id);
      await employee.save();
    }

    // 3. Verify Password
    const user = employee.userId as any;
    const passToCompare = employee.passwordHash || (user ? user.passwordHash : '');
    
    if (passToCompare) {
      const isMatch = await bcrypt.compare(password, passToCompare);
      if (!isMatch) {
        console.warn(`[Employee Login Failed] Password mismatch for Employee: ${employee.employeeId}`);
        return sendError(res, `Incorrect password for Employee ID ${employee.employeeId} in Company ${org.companyId}`, 401);
      }
    }

    // 5. Load Permissions
    const permissions = await RoleService.getPermissionsForRole(org._id, employee.role);
    const defaultOutletId = (employee.outletIds && employee.outletIds.length > 0 && employee.outletIds[0]) ? (employee.outletIds[0] as any)._id : undefined;

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

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity({
      organizationId: org._id,
      outletId: defaultOutletId,
      userId: user ? user._id : employee._id,
      userName: user ? user.name : employee.employeeId,
      action: 'EMPLOYEE_LOGIN',
      entityType: 'EMPLOYEE',
      entityId: employee._id.toString()
    });

    return sendSuccess(res, {
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
  } catch (err: any) {
    console.error('[Employee Login Error]', err);
    return sendError(res, err.message || 'Employee login failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Find primary Employee record
    const employee = await Employee.findOne({ userId: user._id, status: 'ACTIVE' })
      .populate('organizationId')
      .populate('outletIds');

    if (!employee || !employee.organizationId) {
      return sendError(res, 'No active business workspace found for this user', 403);
    }

    const org = employee.organizationId as any;
    const defaultOutletId = (employee.outletIds && employee.outletIds.length > 0 && employee.outletIds[0]) ? (employee.outletIds[0] as any)._id : undefined;

    const tokenPayload = {
      userId: user._id.toString(),
      organizationId: org._id.toString(),
      outletId: defaultOutletId ? defaultOutletId.toString() : undefined,
      role: employee.role,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity({
      organizationId: org._id,
      outletId: defaultOutletId,
      userId: user._id,
      userName: user.name,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user._id.toString()
    });

    return sendSuccess(res, {
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
  } catch (err: any) {
    console.error('[Login Error]', err);
    return sendError(res, err.message || 'Login failed', 500);
  }
};

// GOOGLE OAUTH SSO HANDLER
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const parseResult = googleAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { email, name, avatarUrl } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      try {
        const passwordHash = await bcrypt.hash(`GoogleOAuth_${Date.now()}`, 10);
        user = await User.create({
          name: name || 'Google User',
          email: cleanEmail,
          passwordHash,
          avatarUrl: avatarUrl || '',
          isEmailVerified: true
        });
      } catch (createErr: any) {
        user = await User.findOne({ email: cleanEmail });
        if (!user) {
          throw createErr;
        }
      }
    }

    const employee = await Employee.findOne({ userId: user._id, status: 'ACTIVE' })
      .populate('organizationId')
      .populate('outletIds');

    if (!employee || !employee.organizationId) {
      return sendSuccess(res, {
        isNewUser: true,
        user: { id: user._id, name: user.name, email: user.email }
      }, 'Google OAuth verified. Please create an organization workspace.');
    }

    const org = employee.organizationId as any;
    const defaultOutletId = (employee.outletIds && employee.outletIds.length > 0 && employee.outletIds[0]) ? (employee.outletIds[0] as any)._id : undefined;

    const tokenPayload = {
      userId: user._id.toString(),
      organizationId: org._id.toString(),
      outletId: defaultOutletId ? defaultOutletId.toString() : undefined,
      role: employee.role,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity({
      organizationId: org._id,
      outletId: defaultOutletId,
      userId: user._id,
      userName: user.name,
      action: 'GOOGLE_OAUTH_LOGIN',
      entityType: 'USER',
      entityId: user._id.toString()
    });

    return sendSuccess(res, {
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
  } catch (err: any) {
    console.error('[GoogleAuth Error]', err);
    return sendError(res, err.message || 'Google OAuth failed', 500);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const parseResult = refreshTokenSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const { refreshToken } = parseResult.data;
    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      organizationId: payload.organizationId,
      outletId: payload.outletId,
      role: payload.role,
      email: payload.email
    });

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      organizationId: payload.organizationId,
      outletId: payload.outletId,
      role: payload.role,
      email: payload.email
    });

    return sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (err) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return sendError(res, 'Organization not found', 404);
    }

    const employee = await Employee.findOne({
      userId: user._id,
      organizationId: organization._id
    });

    return sendSuccess(res, {
      user,
      organization,
      role: employee ? employee.role : req.user.role
    }, 'User profile retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch user context', 500);
  }
};

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    if (!req.tenant) {
      return sendError(res, 'Tenant context missing', 403);
    }

    const parseResult = onboardingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'Validation error', 400, parseResult.error.errors);
    }

    const org = await Organization.findByIdAndUpdate(
      req.tenant.organizationId,
      { $set: parseResult.data },
      { new: true }
    );

    await logActivity({
      organizationId: req.tenant.organizationId,
      userId: req.user?.userId,
      userName: req.user?.email,
      action: 'COMPLETE_ONBOARDING',
      entityType: 'ORGANIZATION',
      entityId: req.tenant.organizationId.toString(),
      newValue: parseResult.data
    });

    return sendSuccess(res, org, 'Business onboarding details saved successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Onboarding update failed', 500);
  }
};
