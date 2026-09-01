"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const Role_1 = require("../models/Role");
const permissions_1 = require("../constants/permissions");
const enums_1 = require("../constants/enums");
class RoleService {
    /**
     * Seeds default system roles for a newly created Organization
     */
    static async seedDefaultRoles(organizationId) {
        const rolesCreated = {};
        const roleDefinitions = [
            {
                name: 'Organization Owner',
                code: enums_1.UserRole.OWNER,
                description: 'Full organization access and administration',
                permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.OWNER
            },
            {
                name: 'Store Manager',
                code: enums_1.UserRole.MANAGER,
                description: 'Operations, inventory, staff activity, and sales reporting',
                permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.MANAGER
            },
            {
                name: 'Cashier',
                code: enums_1.UserRole.CASHIER,
                description: 'POS counter billing, customer creation, and receipt generation',
                permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.CASHIER
            },
            {
                name: 'Waiter',
                code: enums_1.UserRole.WAITER,
                description: 'Table order management, waiter menu ordering, and KDS ticketing',
                permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.WAITER
            },
            {
                name: 'Kitchen Staff',
                code: enums_1.UserRole.KITCHEN_STAFF,
                description: 'Kitchen Display System (KDS) order status management',
                permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.KITCHEN_STAFF
            },
            {
                name: 'Inventory Staff',
                code: enums_1.UserRole.INVENTORY_STAFF,
                description: 'Stock updates, purchase orders, and supplier management',
                permissions: permissions_1.DEFAULT_ROLE_PERMISSIONS.INVENTORY_STAFF
            }
        ];
        for (const def of roleDefinitions) {
            const role = await Role_1.Role.findOneAndUpdate({ organizationId, code: def.code }, {
                $setOnInsert: {
                    organizationId,
                    name: def.name,
                    code: def.code,
                    description: def.description,
                    isSystem: true,
                    permissions: def.permissions
                }
            }, { upsert: true, new: true });
            rolesCreated[def.code] = role;
        }
        return rolesCreated;
    }
    /**
     * Get permissions for a role or role code
     */
    static async getPermissionsForRole(organizationId, roleCode) {
        const role = await Role_1.Role.findOne({ organizationId, code: roleCode });
        if (role && role.permissions && role.permissions.length > 0) {
            return role.permissions;
        }
        return permissions_1.DEFAULT_ROLE_PERMISSIONS[roleCode] || [];
    }
}
exports.RoleService = RoleService;
