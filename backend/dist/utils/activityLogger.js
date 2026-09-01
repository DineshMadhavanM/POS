"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const ActivityLog_1 = require("../models/ActivityLog");
const logActivity = async (opts) => {
    try {
        await ActivityLog_1.ActivityLog.create({
            organizationId: opts.organizationId,
            outletId: opts.outletId,
            userId: opts.userId,
            userName: opts.userName || 'System',
            action: opts.action,
            entityType: opts.entityType,
            entityId: opts.entityId || '',
            previousValue: opts.previousValue,
            newValue: opts.newValue,
            timestamp: new Date()
        });
    }
    catch (err) {
        console.error('[ActivityLog Error]', err);
    }
};
exports.logActivity = logActivity;
