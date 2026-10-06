import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_super_secure_jwt_secret_token_2026_nowshera';

/**
 * Standard Email & Password Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and password are required.' });
    }

    const userRes = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to process login.' });
  }
});

/**
 * Safe Demo Login (Signs in pre-seeded Manager or Staff without exposing credentials)
 */
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = role?.toUpperCase() === 'STAFF' ? 'STAFF' : 'MANAGER';

    const userRes = await query('SELECT * FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1', [targetRole]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'DEMO_USER_NOT_FOUND', message: `No demo ${targetRole} user found. Please run seed.` });
    }

    const user = userRes.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to sign in demo user.' });
  }
});

/**
 * Current User Profile Verification
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
