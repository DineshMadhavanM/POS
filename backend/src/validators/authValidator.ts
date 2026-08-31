import { z } from 'zod';
import { BusinessType } from '../constants/enums';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  phoneNumber: z.string().optional().or(z.literal('')),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.nativeEnum(BusinessType)
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const googleAuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  avatarUrl: z.string().optional()
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const employeeLoginSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required')
});

export const onboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name required'),
  businessType: z.nativeEnum(BusinessType),
  phoneNumber: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  currency: z.string().default('USD'),
  timezone: z.string().default('UTC'),
  taxRateDefault: z.number().min(0).max(100).default(5),
  invoicePrefix: z.string().default('INV')
});
