import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    message: 'Internal server error',
  });
};

export default errorHandler;
