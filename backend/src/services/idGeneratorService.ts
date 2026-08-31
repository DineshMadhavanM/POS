import { Organization } from '../models/Organization';
import { Employee } from '../models/Employee';
import { BusinessType } from '../constants/enums';
import { Types } from 'mongoose';

export class IdGeneratorService {
  /**
   * Generates a globally unique Company ID (e.g. NX-REST-10001)
   */
  static async generateCompanyId(businessType: BusinessType): Promise<string> {
    const typePrefixMap: Record<BusinessType, string> = {
      [BusinessType.RESTAURANT]: 'REST',
      [BusinessType.CAFE]: 'CAFE',
      [BusinessType.BAKERY]: 'BAKERY',
      [BusinessType.RETAIL]: 'RETAIL'
    };

    const typeCode = typePrefixMap[businessType] || 'POS';
    const totalOrgs = await Organization.countDocuments();
    let counter = totalOrgs + 10001;

    let companyId = `NX-${typeCode}-${counter}`;
    let exists = await Organization.exists({ companyId });

    while (exists) {
      counter += 1;
      companyId = `NX-${typeCode}-${counter}`;
      exists = await Organization.exists({ companyId });
    }

    return companyId;
  }

  /**
   * Generates an Organization-scoped unique Employee ID (e.g. EMP-0001)
   */
  static async generateEmployeeId(organizationId: string | Types.ObjectId): Promise<string> {
    const empCount = await Employee.countDocuments({ organizationId });
    let counter = empCount + 1;
    let employeeId = `EMP-${String(counter).padStart(4, '0')}`;

    let exists = await Employee.exists({ organizationId, employeeId });
    while (exists) {
      counter += 1;
      employeeId = `EMP-${String(counter).padStart(4, '0')}`;
      exists = await Employee.exists({ organizationId, employeeId });
    }

    return employeeId;
  }
}
