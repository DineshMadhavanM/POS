import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { sendError } from '../utils/response';
import { UserRole } from '../constants/enums';

export const verifyTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.organizationId) {
    return sendError(res, 'Organization context missing from token', 403);
  }

  const tokenOrgId = req.user.organizationId;

  // Strict check: If request body, query or params tries to override organizationId, reject if it doesn't match tokenOrgId
  const reqOrgId = req.body?.organizationId || req.query?.organizationId || req.params?.organizationId;
  if (reqOrgId && reqOrgId.toString() !== tokenOrgId.toString()) {
    return sendError(res, 'Access denied: Cannot query or modify data belonging to another organization', 403);
  }

  try {
    req.tenant = {
      organizationId: new Types.ObjectId(tokenOrgId),
      outletId: req.user.outletId ? new Types.ObjectId(req.user.outletId) : undefined,
      role: req.user.role as UserRole
    };
    next();
  } catch (err) {
    return sendError(res, 'Invalid organization context format', 400);
  }
};
