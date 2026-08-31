import { Role, IRole } from '../models/Role';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../constants/enums';
import { Types } from 'mongoose';

export class RoleService {
  /**
   * Seeds default system roles for a newly created Organization
   */
  static async seedDefaultRoles(organizationId: Types.ObjectId): Promise<Record<string, IRole>> {
    const rolesCreated: Record<string, IRole> = {};

    const roleDefinitions = [
      {
        name: 'Organization Owner',
        code: UserRole.OWNER,
        description: 'Full organization access and administration',
        permissions: DEFAULT_ROLE_PERMISSIONS.OWNER
      },
      {
        name: 'Store Manager',
        code: UserRole.MANAGER,
        description: 'Operations, inventory, staff activity, and sales reporting',
        permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER
      },
      {
        name: 'Cashier',
        code: UserRole.CASHIER,
        description: 'POS counter billing, customer creation, and receipt generation',
        permissions: DEFAULT_ROLE_PERMISSIONS.CASHIER
      },
      {
        name: 'Kitchen Staff',
        code: UserRole.KITCHEN_STAFF,
        description: 'Kitchen Display System (KDS) order status management',
        permissions: DEFAULT_ROLE_PERMISSIONS.KITCHEN_STAFF
      },
      {
        name: 'Inventory Staff',
        code: UserRole.INVENTORY_STAFF,
        description: 'Stock updates, purchase orders, and supplier management',
        permissions: DEFAULT_ROLE_PERMISSIONS.INVENTORY_STAFF
      }
    ];

    for (const def of roleDefinitions) {
      const role = await Role.findOneAndUpdate(
        { organizationId, code: def.code },
        {
          $setOnInsert: {
            organizationId,
            name: def.name,
            code: def.code,
            description: def.description,
            isSystem: true,
            permissions: def.permissions
          }
        },
        { upsert: true, new: true }
      );
      rolesCreated[def.code] = role;
    }

    return rolesCreated;
  }

  /**
   * Get permissions for a role or role code
   */
  static async getPermissionsForRole(organizationId: Types.ObjectId, roleCode: string): Promise<string[]> {
    const role = await Role.findOne({ organizationId, code: roleCode });
    if (role && role.permissions && role.permissions.length > 0) {
      return role.permissions;
    }
    return DEFAULT_ROLE_PERMISSIONS[roleCode] || [];
  }
}
