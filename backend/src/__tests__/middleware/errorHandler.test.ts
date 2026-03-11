import { Request, Response, NextFunction } from 'express';
import errorHandler from '../../middleware/errorHandler';

describe('Error Handler Middleware (direct)', () => {
  it('should return 500 and error message', () => {
    const err = new Error('Something went wrong');
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('should log the error message', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const err = new Error('Test error message');
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', 'Test error message');
    consoleSpy.mockRestore();
  });
});
