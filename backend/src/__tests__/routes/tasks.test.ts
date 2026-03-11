import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Redis from 'ioredis-mock';
import app from '../../app';
import User from '../../models/User';
import Task from '../../models/Task';
import { setRedisClient } from '../../config/redis';

let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  setRedisClient(new Redis() as any);
});

beforeEach(async () => {
  // Create a user and get token
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

  authToken = res.body.token;
  userId = res.body.user.id;

  // Reset Redis mock
  setRedisClient(new Redis() as any);
});

afterEach(async () => {
  await Task.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const validTask = {
  title: 'Test Task',
  description: 'Test description',
  dueDate: '2026-12-31T00:00:00.000Z',
};

describe('Task Routes', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTask);

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe(validTask.title);
      expect(res.body.task.description).toBe(validTask.description);
      expect(res.body.task.status).toBe('pending');
      expect(res.body.task.owner).toBe(userId);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send(validTask);

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ dueDate: '2026-12-31' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing dueDate', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTask, status: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create some tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTask);

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTask, title: 'Task 2', status: 'completed' });
    });

    it('should return all tasks for logged-in user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].status).toBe('completed');
    });

    it('should return cached results on second request', async () => {
      // First request - from database
      const res1 = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res1.status).toBe(200);
      expect(res1.body.source).toBe('database');

      // Second request - from cache
      const res2 = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.source).toBe('cache');
      expect(res2.body.tasks).toHaveLength(2);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    it('should not return tasks from another user', async () => {
      // Create another user
      const otherRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherRes.body.token;

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(0);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTask);

      taskId = res.body.task._id;
    });

    it('should update a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Updated Title');
      expect(res.body.task.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid task ID', async () => {
      const res = await request(app)
        .put('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(400);
    });

    it('should not allow updating another user\'s task', async () => {
      const otherRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherRes.body.token}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(404);
    });

    it('should invalidate cache after update', async () => {
      // Populate cache
      await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      // Update task
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      // Next GET should be from database (cache invalidated)
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.source).toBe('database');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTask);

      taskId = res.body.task._id;
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Verify task is deleted
      const getRes = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.body.tasks).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid task ID', async () => {
      const res = await request(app)
        .delete('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('should not allow deleting another user\'s task', async () => {
      const otherRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherRes.body.token}`);

      expect(res.status).toBe(404);
    });

    it('should invalidate cache after delete', async () => {
      // Populate cache
      await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      // Delete task
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Next GET should be from database
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.source).toBe('database');
    });
  });

  describe('GET /api/tasks - Additional Filters', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Old Task', dueDate: '2024-01-15', status: 'pending' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Future Task', dueDate: '2028-06-01', status: 'completed' });
    });

    it('should filter tasks by dueDate', async () => {
      const res = await request(app)
        .get('/api/tasks?dueDate=2025-01-01')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0].title).toBe('Old Task');
    });

    it('should filter by both status and dueDate', async () => {
      const res = await request(app)
        .get('/api/tasks?status=pending&dueDate=2025-01-01')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBe(1);
    });

    it('should return 400 for invalid status filter', async () => {
      const res = await request(app)
        .get('/api/tasks?status=invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid dueDate filter', async () => {
      const res = await request(app)
        .get('/api/tasks?dueDate=not-a-date')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('should cache filtered results separately', async () => {
      // First request with status filter
      const res1 = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res1.body.source).toBe('database');

      // Second request with same filter - should be cached
      const res2 = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res2.body.source).toBe('cache');

      // Different filter should NOT be cached
      const res3 = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res3.body.source).toBe('database');
    });
  });

  describe('PUT /api/tasks/:id - Field Updates', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Original', description: 'desc', dueDate: '2027-01-01' });
      taskId = res.body.task._id;
    });

    it('should update only description', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'updated desc' });

      expect(res.status).toBe(200);
      expect(res.body.task.description).toBe('updated desc');
      expect(res.body.task.title).toBe('Original');
    });

    it('should update only dueDate', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ dueDate: '2028-06-15' });

      expect(res.status).toBe(200);
    });
  });
});
