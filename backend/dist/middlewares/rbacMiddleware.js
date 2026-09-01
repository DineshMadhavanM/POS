"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = void 0;
const enums_1 = require("../constants/enums");
const response_1 = require("../utils/response");
const roleService_1 = require("../services/roleService");
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.tenant || !req.tenant.role) {
            return (0, response_1.sendError)(res, 'User role context unverified', 403);
        }
        if (req.tenant.role === enums_1.UserRole.OWNER) {
            return next();
        }
        if (!allowedRoles.includes(req.tenant.role)) {
            return (0, response_1.sendError)(res, `Access denied: Role '${req.tenant.role}' does not have sufficient permissions`, 403);
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.tenant || !req.user) {
                return (0, response_1.sendError)(res, 'Authentication context missing', 401);
            }
            if (req.tenant.role === enums_1.UserRole.OWNER) {
                return next();
            }
            const permissions = req.user.permissions && req.user.permissions.length > 0
                ? req.user.permissions
                : await roleService_1.RoleService.getPermissionsForRole(req.tenant.organizationId, req.user.role);
            if (!permissions.includes(permission)) {
                return (0, response_1.sendError)(res, `Access denied: You don't have permission to access this feature (${permission})`, 403);
            }
            next();
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message || 'Authorization check failed', 500);
        }
    };
};
exports.requirePermission = requirePermission;
