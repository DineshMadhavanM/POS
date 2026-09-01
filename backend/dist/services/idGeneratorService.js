"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdGeneratorService = void 0;
const Organization_1 = require("../models/Organization");
const Employee_1 = require("../models/Employee");
const enums_1 = require("../constants/enums");
class IdGeneratorService {
    /**
     * Generates a globally unique Company ID (e.g. NX-REST-10001)
     */
    static async generateCompanyId(businessType) {
        const typePrefixMap = {
            [enums_1.BusinessType.RESTAURANT]: 'REST',
            [enums_1.BusinessType.CAFE]: 'CAFE',
            [enums_1.BusinessType.BAKERY]: 'BAKERY',
            [enums_1.BusinessType.RETAIL]: 'RETAIL'
        };
        const typeCode = typePrefixMap[businessType] || 'POS';
        const totalOrgs = await Organization_1.Organization.countDocuments();
        let counter = totalOrgs + 10001;
        let companyId = `NX-${typeCode}-${counter}`;
        let exists = await Organization_1.Organization.exists({ companyId });
        while (exists) {
            counter += 1;
            companyId = `NX-${typeCode}-${counter}`;
            exists = await Organization_1.Organization.exists({ companyId });
        }
        return companyId;
    }
    /**
     * Generates an Organization-scoped unique Employee ID (e.g. EMP-0001)
     */
    static async generateEmployeeId(organizationId) {
        const empCount = await Employee_1.Employee.countDocuments({ organizationId });
        let counter = empCount + 1;
        let employeeId = `EMP-${String(counter).padStart(4, '0')}`;
        let exists = await Employee_1.Employee.exists({ organizationId, employeeId });
        while (exists) {
            counter += 1;
            employeeId = `EMP-${String(counter).padStart(4, '0')}`;
            exists = await Employee_1.Employee.exists({ organizationId, employeeId });
        }
        return employeeId;
    }
}
exports.IdGeneratorService = IdGeneratorService;
