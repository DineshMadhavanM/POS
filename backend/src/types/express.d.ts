import type { ITokenPayload } from '../utils/token';
import type { Types } from 'mongoose';
import type { UserRole } from '../constants/enums';

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
      tenant?: {
        organizationId: Types.ObjectId;
        outletId?: Types.ObjectId;
        role: UserRole;
      };
    }
  }
}
