import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task';
import auth, { AuthRequest } from '../middleware/auth';
import validate from '../middleware/validate';
import { getRedisClient } from '../config/redis';

const router = Router();

const CACHE_TTL = 300; // 5 minutes

// Helper: get cache key for a user's tasks
const getCacheKey = (userId: string): string => `tasks:${userId}`;

// Helper: invalidate cache for a user
const invalidateCache = async (userId: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    const pattern = `tasks:${userId}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
    // Don't throw - cache errors shouldn't break functionality
  }
};

// GET /api/tasks - List tasks for logged-in user (with optional filters)
router.get(
  '/',
  auth,
  [
    query('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be pending or completed'),
    query('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const { status, dueDate } = req.query;

      // Build cache key based on filters
      let cacheKey = getCacheKey(userId);
      if (status) cacheKey += `:status:${status}`;
      if (dueDate) cacheKey += `:due:${dueDate}`;

      // Try cache first
      try {
        const redis = getRedisClient();
        const cached = await redis.get(cacheKey);
        if (cached) {
          res.status(200).json({
            tasks: JSON.parse(cached),
            source: 'cache',
          });
          return;
        }
      } catch (cacheError) {
        console.error('Cache read error:', cacheError);
        // Continue without cache
      }

      // Build query
      const filter: Record<string, any> = { owner: req.user!._id };
      if (status) filter.status = status;
      if (dueDate) filter.dueDate = { $lte: new Date(dueDate as string) };

      const tasks = await Task.find(filter).sort({ createdAt: -1 });

      // Cache the result
      try {
        const redis = getRedisClient();
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(tasks));
      } catch (cacheError) {
        console.error('Cache write error:', cacheError);
      }

      res.status(200).json({ tasks, source: 'database' });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /api/tasks - Create a new task
router.post(
  '/',
  auth,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title is required (max 200 characters)'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be at most 2000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be pending or completed'),
    body('dueDate')
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, status, dueDate } = req.body;

      const task = new Task({
        title,
        description: description || '',
        status: status || 'pending',
        dueDate: new Date(dueDate),
        owner: req.user!._id,
      });

      await task.save();

      // Invalidate cache
      await invalidateCache(req.user!._id.toString());

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /api/tasks/:id - Update a task
router.put(
  '/:id',
  auth,
  [
    param('id').custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid task ID');
      }
      return true;
    }),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be at most 2000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be pending or completed'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Find task and ensure ownership
      const task = await Task.findOne({ _id: id, owner: req.user!._id });
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      // Apply updates
      if (updates.title !== undefined) task.title = updates.title;
      if (updates.description !== undefined) task.description = updates.description;
      if (updates.status !== undefined) task.status = updates.status;
      if (updates.dueDate !== undefined) task.dueDate = new Date(updates.dueDate);

      await task.save();

      // Invalidate cache
      await invalidateCache(req.user!._id.toString());

      res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE /api/tasks/:id - Delete a task
router.delete(
  '/:id',
  auth,
  [
    param('id').custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid task ID');
      }
      return true;
    }),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const task = await Task.findOneAndDelete({ _id: id, owner: req.user!._id });
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }

      // Invalidate cache
      await invalidateCache(req.user!._id.toString());

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
