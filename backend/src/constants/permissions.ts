export const PERMISSIONS = {
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
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: Object.values(PERMISSIONS),
  MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_REFUND,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.KITCHEN_VIEW,
    PERMISSIONS.KITCHEN_MANAGE,
    PERMISSIONS.REPORTS_VIEW
  ],
  CASHIER: [
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.REPORTS_VIEW
  ],
  KITCHEN_STAFF: [
    PERMISSIONS.KITCHEN_VIEW,
    PERMISSIONS.KITCHEN_MANAGE
  ],
  INVENTORY_STAFF: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_ADJUST
  ]
};
