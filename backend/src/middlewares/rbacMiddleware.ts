import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/enums';
import { sendError } from '../utils/response';
import { RoleService } from '../services/roleService';

export const requireRole = (allowedRoles: (UserRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant || !req.tenant.role) {
      return sendError(res, 'User role context unverified', 403);
    }

    if (req.tenant.role === UserRole.OWNER) {
      return next();
    }

    if (!allowedRoles.includes(req.tenant.role)) {
      return sendError(res, `Access denied: Role '${req.tenant.role}' does not have sufficient permissions`, 403);
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant || !req.user) {
        return sendError(res, 'Authentication context missing', 401);
      }

      if (req.tenant.role === UserRole.OWNER) {
        return next();
      }

      const permissions = req.user.permissions && req.user.permissions.length > 0
        ? req.user.permissions
        : await RoleService.getPermissionsForRole(req.tenant.organizationId, req.user.role);

      if (!permissions.includes(permission)) {
        return sendError(res, `Access denied: You don't have permission to access this feature (${permission})`, 403);
      }

      next();
    } catch (err: any) {
      return sendError(res, err.message || 'Authorization check failed', 500);
    }
  };
};
