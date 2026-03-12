import mongoose from 'mongoose';
import User from '../src/models/User';
import Task from '../src/models/Task';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-tracker';

async function setup() {
  await mongoose.connect(uri);
  console.log('Connected to Atlas - task-tracker database');

  // Create collections
  await User.createCollection();
  console.log('Created users collection');

  await Task.createCollection();
  console.log('Created tasks collection');

  // Sync indexes defined in schemas
  await User.syncIndexes();
  console.log('Synced user indexes (unique email)');

  await Task.syncIndexes();
  console.log('Synced task indexes (owner+status, owner+dueDate)');

  // Seed a demo user
  const existingUser = await User.findOne({ email: 'demo@tasktracker.com' });
  if (!existingUser) {
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@tasktracker.com',
      password: 'demo123456',
    });
    await demoUser.save();
    console.log('Created demo user: demo@tasktracker.com / demo123456');

    // Seed sample tasks
    const tasks = [
      { title: 'Complete project setup', description: 'Set up the development environment with all required tools', status: 'completed', dueDate: new Date('2026-03-01'), owner: demoUser._id },
      { title: 'Design database schema', description: 'Create MongoDB schemas for users and tasks', status: 'completed', dueDate: new Date('2026-03-05'), owner: demoUser._id },
      { title: 'Implement authentication', description: 'Build JWT-based signup, login, and token validation', status: 'completed', dueDate: new Date('2026-03-08'), owner: demoUser._id },
      { title: 'Build task CRUD API', description: 'Create REST endpoints for task create, read, update, delete', status: 'completed', dueDate: new Date('2026-03-10'), owner: demoUser._id },
      { title: 'Add Redis caching', description: 'Cache task queries with Redis for improved performance', status: 'completed', dueDate: new Date('2026-03-11'), owner: demoUser._id },
      { title: 'Write unit tests', description: 'Achieve 80%+ branch coverage with Jest and Supertest', status: 'pending', dueDate: new Date('2026-03-15'), owner: demoUser._id },
      { title: 'Build frontend dashboard', description: 'Create the Next.js dashboard with task management UI', status: 'pending', dueDate: new Date('2026-03-18'), owner: demoUser._id },
      { title: 'Deploy to production', description: 'Deploy backend and frontend to cloud hosting', status: 'pending', dueDate: new Date('2026-03-25'), owner: demoUser._id },
    ];

    await Task.insertMany(tasks);
    console.log('Seeded ' + tasks.length + ' sample tasks');
  } else {
    console.log('Demo user already exists, skipping seed');
  }

  // Verify
  const userCount = await User.countDocuments();
  const taskCount = await Task.countDocuments();
  const pendingCount = await Task.countDocuments({ status: 'pending' });
  const completedCount = await Task.countDocuments({ status: 'completed' });

  console.log('\n=== Database Summary ===');
  console.log('  Users: ' + userCount);
  console.log('  Tasks: ' + taskCount + ' (pending: ' + pendingCount + ', completed: ' + completedCount + ')');

  const userIndexes = await User.collection.indexes();
  console.log('  User indexes:', userIndexes.map((i: any) => i.name).join(', '));
  const taskIndexes = await Task.collection.indexes();
  console.log('  Task indexes:', taskIndexes.map((i: any) => i.name).join(', '));

  await mongoose.connection.close();
  console.log('\nDatabase setup complete!');
}

setup().catch(err => { console.error('Setup failed:', err); process.exit(1); });
