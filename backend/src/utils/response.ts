import { Response } from 'express';

export const sendSuccess = (res: Response, data: any = null, message: string = 'Success', statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: Response, error: string = 'An unexpected error occurred', statusCode: number = 400, details: any = null) => {
  return res.status(statusCode).json({
    success: false,
    error,
    details
  });
};
