import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import auth, { AuthRequest } from '../../middleware/auth';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Auth Middleware - Internal Server Error branch', () => {
  it('should return 500 when a non-JWT error is thrown', async () => {
    // Mock jwt.verify to throw a generic error (not jwt-specific)
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Database connection lost');
    });

    const req = {
      headers: { authorization: 'Bearer valid-looking-token' },
    } as AuthRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for JsonWebTokenError', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid signature');
    });

    const req = {
      headers: { authorization: 'Bearer bad-token' },
    } as AuthRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token.' });
  });

  it('should return 401 for TokenExpiredError', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });

    const req = {
      headers: { authorization: 'Bearer expired-token' },
    } as AuthRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token expired.' });
  });
});
