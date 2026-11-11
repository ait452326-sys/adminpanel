const express = require('express');
const { pool } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, full_name, username, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [req.session.user.id]
    );
    if (!rows.length) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Account not found. Please log in again.' });
    }
    const user = rows[0];
    res.json({
      message: 'Welcome to your admin dashboard. You are successfully logged in.',
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// User directory is restricted to the first account (administrator).
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, full_name AS fullName, username, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
