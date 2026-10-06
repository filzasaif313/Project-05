import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_super_secure_jwt_secret_token_2026_nowshera';
const INTERNAL_AGENT_SECRET = process.env.INTERNAL_AGENT_SECRET || 'stocksense_internal_n8n_agent_auth_secret_2026';

/**
 * Verifies standard client JWT token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Sign-in required to access this resource.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch live user to ensure account is active and role is up-to-date
    const userRes = await query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'USER_NOT_FOUND', message: 'User account no longer exists.' });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'INVALID_TOKEN', message: 'Session expired or invalid. Please sign in again.' });
  }
}

/**
 * Restricts route strictly to Manager role
 */
export function requireManager(req, res, next) {
  if (!req.user || req.user.role !== 'MANAGER') {
    return res.status(403).json({
      error: 'PERMISSION_DENIED',
      message: 'Access denied: This action or data is restricted strictly to Managers.'
    });
  }
  next();
}

/**
 * Creates a signed token specifically for n8n internal tool callbacks
 */
export function createInternalAgentToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, type: 'INTERNAL_AGENT' },
    INTERNAL_AGENT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Verifies that an incoming tool call from n8n has a valid internal agent token
 */
export async function authenticateInternalAgentToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED_TOOL', message: 'Internal agent authorization missing.' });
  }

  try {
    const decoded = jwt.verify(token, INTERNAL_AGENT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'INVALID_AGENT_TOKEN', message: 'Invalid or expired agent session.' });
  }
}
