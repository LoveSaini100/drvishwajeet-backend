import express from 'express';
import Admin from '../models/Admin.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * Auto-seed or verify admin user in MongoDB on startup
 */
export const initAdminUser = async () => {
  try {
    const configuredUser = (process.env.ADMIN_USERNAME || 'admin@drvishwajeet.com').trim().toLowerCase();
    const configuredPass = (process.env.ADMIN_PASSWORD || 'Supriya@2026').trim();

    // Check if the configured admin exists in MongoDB
    const existingAdmin = await Admin.findOne({ username: configuredUser });

    if (!existingAdmin) {
      const hashedPassword = await Admin.hashPassword(configuredPass);
      await Admin.create({
        username: configuredUser,
        password: hashedPassword,
        name: 'Dr. Vishwajeet Admin',
        role: 'superadmin',
      });
      console.log(`🔐 Admin user initialized in MongoDB Database: [${configuredUser}]`);
    } else {
      console.log(`🔐 Admin account verified in MongoDB Database: [${existingAdmin.username}]`);
    }
  } catch (error) {
    console.error('Error initializing admin user in MongoDB:', error.message);
  }
};

/**
 * @route   POST /api/admin/login
 * @desc    Strict database authentication for Admin Panel
 * @access  Public
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const inputUser = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const inputPass = typeof password === 'string' ? password.trim() : '';

    if (!inputUser || !inputPass) {
      return res.status(400).json({
        success: false,
        message: 'Both admin username/email and password are required.',
      });
    }

    // 1. Query MongoDB Database for Admin user
    let admin = await Admin.findOne({ username: inputUser });

    // Fallback: If database has no admin records yet, initialize once
    if (!admin) {
      const count = await Admin.countDocuments();
      if (count === 0) {
        await initAdminUser();
        admin = await Admin.findOne({ username: inputUser });
      }
    }

    // 2. If user not found in database -> STRICT REJECTION
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // 3. Verify bcrypt password hash stored in database -> STRICT REJECTION ON MISMATCH
    const isPasswordCorrect = await admin.comparePassword(inputPass);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // 4. Update last login timestamp in MongoDB
    admin.lastLogin = new Date();
    await admin.save();

    // 5. Generate secure session token
    const token = 'admin_session_' + crypto.randomBytes(24).toString('hex');

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error('Database Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database authentication error. Please try again.',
    });
  }
});

/**
 * @route   POST /api/admin/change-password
 * @desc    Change admin password stored in MongoDB
 * @access  Admin
 */
router.post('/admin/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body || {};
    const inputUser = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const inputCurrent = typeof currentPassword === 'string' ? currentPassword.trim() : '';
    const inputNew = typeof newPassword === 'string' ? newPassword.trim() : '';

    if (!inputUser || !inputCurrent || !inputNew) {
      return res.status(400).json({
        success: false,
        message: 'Username, current password, and new password are required.',
      });
    }

    if (inputNew.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const admin = await Admin.findOne({ username: inputUser });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found in database.',
      });
    }

    const isMatch = await admin.comparePassword(inputCurrent);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    // Hash and save new password in MongoDB
    admin.password = await Admin.hashPassword(inputNew);
    await admin.save();

    return res.json({
      success: true,
      message: 'Admin password successfully updated in database.',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password in database.',
    });
  }
});

export default router;
