import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis-mock';
import app from '../../app';
import User from '../../models/User';
import config from '../../config';
import { setRedisClient } from '../../config/redis';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  setRedisClient(new Redis() as any);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth Middleware', () => {
  it('should reject request with no Authorization header', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('No token');
  });

  it('should reject request with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'NotBearer token');

    expect(res.status).toBe(401);
  });

  it('should reject request with expired token', async () => {
    const user = await new User({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    }).save();

    // Create a token that expired 10 seconds ago
    const expiredToken = jwt.sign(
      { id: user._id, iat: Math.floor(Date.now() / 1000) - 20 },
      config.jwtSecret,
      { expiresIn: 1 } // expires in 1 second from iat, which was 20s ago
    );

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired|Invalid/i);
  });

  it('should reject request with token for deleted user', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });

    const token = signupRes.body.token;

    // Delete the user
    await User.deleteMany({});

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('User not found');
  });

  it('should pass with valid token', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });

    const token = signupRes.body.token;

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe('Health Check', () => {
  it('should return 200 for /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
