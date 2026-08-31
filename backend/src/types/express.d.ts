import { ITokenPayload } from '../utils/token';
import { Types } from 'mongoose';
import { UserRole } from '../constants/enums';

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
