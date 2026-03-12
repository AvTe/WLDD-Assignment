import { Router, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import config from '../config';
import validate from '../middleware/validate';
import auth, { AuthRequest } from '../middleware/auth';
import firebaseAdmin from '../config/firebase';

const router = Router();

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists with this email' });
        return;
      }

      // Create new user
      const user = new User({ name, email, password });
      await user.save();

      // Generate JWT
      const token = jwt.sign({ id: user._id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as any,
      });

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already exists with this email' });
        return;
      }
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as any,
      });

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/google - Google sign-in via Firebase
router.post(
  '/google',
  [
    body('idToken').notEmpty().withMessage('Firebase ID token is required'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;

      // Verify the Firebase ID token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        res.status(400).json({ message: 'Google account must have an email' });
        return;
      }

      // Find existing user by email or firebaseUid
      let user = await User.findOne({ $or: [{ email }, { firebaseUid: uid }] });

      if (!user) {
        // Create new user from Google profile
        user = new User({
          name: name || email.split('@')[0],
          email,
          firebaseUid: uid,
          avatar: picture || '',
        });
        await user.save();
      } else if (!user.firebaseUid) {
        // Link Firebase to existing email user
        user.firebaseUid = uid;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      } else if (picture && !user.avatar) {
        user.avatar = picture;
        await user.save();
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as any,
      });

      res.status(200).json({
        message: 'Google login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        res.status(401).json({ message: 'Invalid or expired Google token' });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      // Always return success to prevent email enumeration
      if (!user) {
        res.status(200).json({ message: 'If an account exists, a reset link has been generated.' });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // In production, send email with reset link. For now, return the token directly.
      res.status(200).json({
        message: 'If an account exists, a reset link has been generated.',
        // DEV ONLY: return token for testing
        resetToken,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { token: resetToken, password } = req.body;
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      }).select('+resetPasswordToken +resetPasswordExpires');

      if (!user) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /api/auth/settings - Update user profile
router.put(
  '/settings',
  auth,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { name } = req.body;

      if (name) user.name = name;
      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Settings update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /api/auth/change-password - Change password (authenticated)
router.put(
  '/change-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user!._id).select('+password');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Google-only users have no password
      if (!user.password) {
        res.status(400).json({ message: 'Account uses Google sign-in. Password cannot be changed here.' });
        return;
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
