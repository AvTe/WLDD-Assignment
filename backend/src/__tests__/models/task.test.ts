import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Task from '../../models/Task';
import User from '../../models/User';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create a user to own tasks
  const user = await new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  }).save();
  userId = user._id;
});

afterEach(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Task Model', () => {
  const getValidTask = () => ({
    title: 'Test Task',
    description: 'Test description',
    status: 'pending' as const,
    dueDate: new Date('2026-12-31'),
    owner: userId,
  });

  it('should create a task successfully', async () => {
    const task = new Task(getValidTask());
    const saved = await task.save();

    expect(saved._id).toBeDefined();
    expect(saved.title).toBe('Test Task');
    expect(saved.description).toBe('Test description');
    expect(saved.status).toBe('pending');
    expect(saved.owner).toEqual(userId);
    expect(saved.createdAt).toBeDefined();
  });

  it('should default status to pending', async () => {
    const taskData = getValidTask();
    delete (taskData as any).status;
    const task = new Task(taskData);
    const saved = await task.save();

    expect(saved.status).toBe('pending');
  });

  it('should not save task without required fields', async () => {
    const task = new Task({});

    let error: any;
    try {
      await task.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.dueDate).toBeDefined();
    expect(error.errors.owner).toBeDefined();
  });

  it('should reject invalid status', async () => {
    const task = new Task({ ...getValidTask(), status: 'invalid' });

    let error: any;
    try {
      await task.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it('should allow completed status', async () => {
    const task = new Task({ ...getValidTask(), status: 'completed' });
    const saved = await task.save();

    expect(saved.status).toBe('completed');
  });

  it('should default description to empty string', async () => {
    const taskData = getValidTask();
    delete (taskData as any).description;
    const task = new Task(taskData);
    const saved = await task.save();

    expect(saved.description).toBe('');
  });
});
