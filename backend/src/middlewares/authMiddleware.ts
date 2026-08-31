import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired access token', 401);
  }
};
