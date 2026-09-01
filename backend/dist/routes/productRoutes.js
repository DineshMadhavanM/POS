"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantMiddleware_1 = require("../middlewares/tenantMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const enums_1 = require("../constants/enums");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, tenantMiddleware_1.verifyTenant);
// Product Catalog (Readable by all active tenant roles: Owner, Admin, Manager, Cashier, Waiter, Kitchen, Inventory)
router.get('/products', productController_1.getProducts);
router.post('/products', (0, rbacMiddleware_1.requireRole)([enums_1.UserRole.OWNER, enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.INVENTORY_STAFF]), productController_1.createProduct);
router.put('/products/:id', (0, rbacMiddleware_1.requireRole)([enums_1.UserRole.OWNER, enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.INVENTORY_STAFF]), productController_1.updateProduct);
router.delete('/products/:id', (0, rbacMiddleware_1.requireRole)([enums_1.UserRole.OWNER, enums_1.UserRole.ADMIN]), productController_1.deleteProduct);
// Categories
router.get('/categories', productController_1.getCategories);
router.post('/categories', (0, rbacMiddleware_1.requireRole)([enums_1.UserRole.OWNER, enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.INVENTORY_STAFF]), productController_1.createCategory);
router.put('/categories/:id', (0, rbacMiddleware_1.requireRole)([enums_1.UserRole.OWNER, enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.INVENTORY_STAFF]), productController_1.updateCategory);
router.delete('/categories/:id', (0, rbacMiddleware_1.requireRole)([enums_1.UserRole.OWNER, enums_1.UserRole.ADMIN]), productController_1.deleteCategory);
exports.default = router;
