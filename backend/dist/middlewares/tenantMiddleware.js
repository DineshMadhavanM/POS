"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTenant = void 0;
const mongoose_1 = require("mongoose");
const response_1 = require("../utils/response");
const verifyTenant = (req, res, next) => {
    if (!req.user || !req.user.organizationId) {
        return (0, response_1.sendError)(res, 'Organization context missing from token', 403);
    }
    const tokenOrgId = req.user.organizationId;
    // Strict check: If request body, query or params tries to override organizationId, reject if it doesn't match tokenOrgId
    const reqOrgId = req.body?.organizationId || req.query?.organizationId || req.params?.organizationId;
    if (reqOrgId && reqOrgId.toString() !== tokenOrgId.toString()) {
        return (0, response_1.sendError)(res, 'Access denied: Cannot query or modify data belonging to another organization', 403);
    }
    try {
        req.tenant = {
            organizationId: new mongoose_1.Types.ObjectId(tokenOrgId),
            outletId: req.user.outletId ? new mongoose_1.Types.ObjectId(req.user.outletId) : undefined,
            role: req.user.role
        };
        next();
    }
    catch (err) {
        return (0, response_1.sendError)(res, 'Invalid organization context format', 400);
    }
};
exports.verifyTenant = verifyTenant;
