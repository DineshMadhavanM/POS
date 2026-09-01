"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminController_1 = require("../controllers/superAdminController");
const router = (0, express_1.Router)();
// Public Super Admin Authentication
router.post('/login', superAdminController_1.superAdminLogin);
// Master Tenant Directory Endpoint
router.get('/tenants', superAdminController_1.getSuperAdminTenants);
exports.default = router;
