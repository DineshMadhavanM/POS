import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../constants/enums';

export interface ITokenPayload {
  userId: string;
  organizationId: string;
  companyId?: string;
  employeeId?: string;
  outletId?: string;
  role: UserRole | string;
  permissions?: string[];
  email: string;
}

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
};
