const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();
const SALT_ROUNDS = 12;

function validationMessage(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  next();
}

router.post('/register', [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters.'),
  body('username').trim().matches(/^[a-zA-Z0-9_]{3,30}$/).withMessage('Username must be 3–30 characters and use only letters, numbers or underscores.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
], validationMessage, async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'That email or username is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    // The first registered account becomes the administrator. Later registrations are regular users.
    const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    const role = Number(countRows[0].total) === 0 ? 'admin' : 'user';

    const [result] = await pool.execute(
      'INSERT INTO users (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, username, email, passwordHash, role]
    );

    req.session.user = {
      id: result.insertId, fullName, username, email, role
    };
    req.session.save((error) => {
      if (error) return next(error);
      res.status(201).json({ message: 'Account created successfully.', user: req.session.user, redirect: '/admin/dashboard' });
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That email or username is already registered.' });
    }
    next(error);
  }
});

router.post('/login', [
  body('identifier').trim().notEmpty().withMessage('Enter your email or username.'),
  body('password').notEmpty().withMessage('Enter your password.')
], validationMessage, async (req, res, next) => {
  try {
    const { identifier, password, rememberMe } = req.body;
    const [rows] = await pool.execute(
      'SELECT id, full_name, username, email, password_hash, role FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );
    if (!rows.length) return res.status(401).json({ message: 'Incorrect email/username or password.' });

    const user = rows[0];
    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) return res.status(401).json({ message: 'Incorrect email/username or password.' });

    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.user = {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role
      };
      if (rememberMe === true) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
      }
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.json({ message: 'Login successful.', user: req.session.user, redirect: '/admin/dashboard' });
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  if (!req.session) return res.json({ message: 'Logged out.' });
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('admin.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  res.json({ user: req.session.user });
});

module.exports = router;
