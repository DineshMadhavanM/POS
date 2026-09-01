import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Invoice } from '../models/Invoice';
import { sendSuccess, sendError } from '../utils/response';
import { generateAccessToken } from '../utils/token';

const SUPER_ADMIN_EMAIL = 'dadmin@nexstack.com';
const SUPER_ADMIN_PASS = 'DMaddy@003';

/**
 * Super Admin Master Login
 */
export const superAdminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both Email ID and Password', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check credentials against Super Admin master credentials
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASS) {
      const tokenPayload = {
        userId: 'SUPER_ADMIN_ROOT',
        role: 'SUPER_ADMIN',
        email: SUPER_ADMIN_EMAIL,
        isSuperAdmin: true
      };

      const token = generateAccessToken(tokenPayload as any);

      return sendSuccess(res, {
        token,
        email: SUPER_ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        name: 'Master Super Administrator'
      }, 'Super Admin authenticated successfully');
    }

    // Also support any registered user with super-admin password fallback
    const user = await User.findOne({ email: cleanEmail });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const org = await Organization.findOne({ ownerId: user._id });
      const tokenPayload = {
        userId: user._id.toString(),
        organizationId: org ? org._id.toString() : undefined,
        role: 'SUPER_ADMIN',
        email: user.email,
        isSuperAdmin: true
      };
      const token = generateAccessToken(tokenPayload as any);

      return sendSuccess(res, {
        token,
        email: user.email,
        role: 'SUPER_ADMIN',
        name: user.name
      }, 'Admin authenticated successfully');
    }

    return sendError(res, 'Invalid Super Admin credentials. Please check your email and password.', 401);
  } catch (err: any) {
    console.error('[Super Admin Login Error]', err);
    return sendError(res, err.message || 'Super Admin login failed', 500);
  }
};

/**
 * Get all registered tenants & master statistics across the platform
 */
export const getSuperAdminTenants = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all registered organizations with owner details
    const organizations = await Organization.find()
      .populate('ownerId')
      .sort({ createdAt: -1 });

    const totalUsersCount = await User.countDocuments();
    const totalInvoices = await Invoice.find({ isRefunded: false });
    const platformRevenue = totalInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);

    // 2. Aggregate per-tenant statistics
    const tenants = await Promise.all(
      organizations.map(async (org) => {
        const owner = org.ownerId as any;
        const productsCount = await Product.countDocuments({ organizationId: org._id });
        const ordersCount = await Order.countDocuments({ organizationId: org._id });

        return {
          _id: org._id,
          shopName: org.businessName,
          businessType: org.businessType,
          companyId: org.companyId,
          adminName: owner ? owner.name : 'Business Owner',
          adminEmail: owner ? owner.email : org.email,
          adminPhone: (owner && owner.phoneNumber) ? owner.phoneNumber : (org.phoneNumber || 'N/A'),
          address: org.address || 'N/A',
          gstin: org.gstin || 'N/A',
          currency: org.currency || 'INR',
          subscriptionPlan: org.subscriptionPlan || 'FREE_TRIAL',
          subscriptionStatus: org.subscriptionStatus || 'ACTIVE',
          productsCount,
          ordersCount,
          createdAt: org.createdAt
        };
      })
    );

    // 3. Compute KPI Breakdown
    const totalShops = tenants.length;
    const totalRestaurants = tenants.filter(t => t.businessType === 'RESTAURANT').length;
    const totalCafes = tenants.filter(t => t.businessType === 'CAFE').length;
    const totalBakeries = tenants.filter(t => t.businessType === 'BAKERY').length;
    const totalRetail = tenants.filter(t => t.businessType === 'RETAIL').length;

    return sendSuccess(res, {
      stats: {
        totalShops,
        totalRestaurants,
        totalCafes,
        totalBakeries,
        totalRetail,
        totalUsers: totalUsersCount,
        platformRevenue
      },
      tenants
    }, 'Super Admin tenant registry retrieved');
  } catch (err: any) {
    console.error('[Super Admin Tenants Error]', err);
    return sendError(res, err.message || 'Failed to fetch tenant registry', 500);
  }
};
