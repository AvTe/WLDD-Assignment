import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('User Model', () => {
  const validUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  it('should create a user successfully', async () => {
    const user = new User(validUserData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUserData.name);
    expect(savedUser.email).toBe(validUserData.email);
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should hash the password before saving', async () => {
    const user = new User(validUserData);
    const savedUser = await user.save();

    // Password should be hashed, not plain text
    const userWithPassword = await User.findById(savedUser._id).select('+password');
    expect(userWithPassword!.password).not.toBe(validUserData.password);
    expect(userWithPassword!.password).toMatch(/^\$2[aby]\$/);
  });

  it('should correctly compare passwords', async () => {
    const user = new User(validUserData);
    await user.save();

    const userWithPassword = await User.findOne({ email: validUserData.email }).select('+password');
    const isMatch = await userWithPassword!.comparePassword('password123');
    const isNotMatch = await userWithPassword!.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should not save user without required fields', async () => {
    const user = new User({});

    let error: any;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should not save user with invalid email', async () => {
    const user = new User({ ...validUserData, email: 'invalid-email' });

    let error: any;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });

  it('should not save duplicate email', async () => {
    await new User(validUserData).save();

    let error: any;
    try {
      await new User(validUserData).save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });

  it('should not include password by default in queries', async () => {
    await new User(validUserData).save();
    const user = await User.findOne({ email: validUserData.email });

    expect(user!.password).toBeUndefined();
  });
});
