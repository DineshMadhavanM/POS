"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PERMISSIONS = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW: 'dashboard.view',
    // POS & Billing
    POS_ACCESS: 'pos.access',
    BILLING_CREATE: 'billing.create',
    BILLING_REFUND: 'billing.refund',
    BILLING_DELETE: 'billing.delete',
    // Products
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_UPDATE: 'products.update',
    PRODUCTS_DELETE: 'products.delete',
    // Inventory
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_UPDATE: 'inventory.update',
    INVENTORY_ADJUST: 'inventory.adjust',
    // Customers
    CUSTOMERS_VIEW: 'customers.view',
    CUSTOMERS_CREATE: 'customers.create',
    // Employees & Roles
    EMPLOYEES_VIEW: 'employees.view',
    EMPLOYEES_CREATE: 'employees.create',
    EMPLOYEES_UPDATE: 'employees.update',
    EMPLOYEES_DELETE: 'employees.delete',
    ROLES_VIEW: 'roles.view',
    ROLES_MANAGE: 'roles.manage',
    // Kitchen Display System (KDS)
    KITCHEN_VIEW: 'kitchen.view',
    KITCHEN_MANAGE: 'kitchen.manage',
    // Reports, Settings, Audit
    REPORTS_VIEW: 'reports.view',
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_MANAGE: 'settings.manage',
    SUBSCRIPTION_MANAGE: 'subscription.manage',
    AUDIT_LOGS_VIEW: 'audit_logs.view'
};
exports.DEFAULT_ROLE_PERMISSIONS = {
    OWNER: Object.values(exports.PERMISSIONS),
    MANAGER: [
        exports.PERMISSIONS.DASHBOARD_VIEW,
        exports.PERMISSIONS.POS_ACCESS,
        exports.PERMISSIONS.BILLING_CREATE,
        exports.PERMISSIONS.BILLING_REFUND,
        exports.PERMISSIONS.PRODUCTS_VIEW,
        exports.PERMISSIONS.PRODUCTS_CREATE,
        exports.PERMISSIONS.PRODUCTS_UPDATE,
        exports.PERMISSIONS.INVENTORY_VIEW,
        exports.PERMISSIONS.INVENTORY_UPDATE,
        exports.PERMISSIONS.INVENTORY_ADJUST,
        exports.PERMISSIONS.CUSTOMERS_VIEW,
        exports.PERMISSIONS.CUSTOMERS_CREATE,
        exports.PERMISSIONS.EMPLOYEES_VIEW,
        exports.PERMISSIONS.KITCHEN_VIEW,
        exports.PERMISSIONS.KITCHEN_MANAGE,
        exports.PERMISSIONS.REPORTS_VIEW
    ],
    CASHIER: [
        exports.PERMISSIONS.POS_ACCESS,
        exports.PERMISSIONS.BILLING_CREATE,
        exports.PERMISSIONS.PRODUCTS_VIEW,
        exports.PERMISSIONS.CUSTOMERS_VIEW,
        exports.PERMISSIONS.CUSTOMERS_CREATE,
        exports.PERMISSIONS.REPORTS_VIEW
    ],
    WAITER: [
        exports.PERMISSIONS.PRODUCTS_VIEW,
        exports.PERMISSIONS.CUSTOMERS_VIEW,
        exports.PERMISSIONS.KITCHEN_VIEW,
        exports.PERMISSIONS.KITCHEN_MANAGE
    ],
    KITCHEN_STAFF: [
        exports.PERMISSIONS.DASHBOARD_VIEW,
        exports.PERMISSIONS.PRODUCTS_VIEW,
        exports.PERMISSIONS.KITCHEN_VIEW,
        exports.PERMISSIONS.KITCHEN_MANAGE
    ],
    INVENTORY_STAFF: [
        exports.PERMISSIONS.PRODUCTS_VIEW,
        exports.PERMISSIONS.INVENTORY_VIEW,
        exports.PERMISSIONS.INVENTORY_UPDATE,
        exports.PERMISSIONS.INVENTORY_ADJUST
    ]
};
