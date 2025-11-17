// api/_auth.js
import jwt from 'jsonwebtoken';
import pool from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_secret';

// Returns { ok: true, userId, method: 'jwt'|'api_key' } or { ok:false, error: '...' }
export async function getUserFromRequest(req) {
  const authHeader = (req.headers.authorization || '').trim();

  // Try JWT first: "Bearer <token>"
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload && payload.uid) return { ok: true, userId: payload.uid, method: 'jwt' };
    } catch (e) {
      return { ok: false, error: 'Invalid token' };
    }
  }

  // Next try API key (exact key string)
  const apiKey = authHeader.replace('Bearer ', '').trim();
  if (apiKey) {
    try {
      const q = await pool.query(`SELECT user_id FROM api_keys WHERE api_key=$1 AND active=true LIMIT 1`, [apiKey]);
      if (q.rows.length) return { ok: true, userId: q.rows[0].user_id, method: 'api_key' };
      return { ok: false, error: 'Invalid API key' };
    } catch (e) {
      console.error('auth db error', e);
      return { ok: false, error: 'Auth DB error' };
    }
  }

  return { ok: false, error: 'Missing auth' };
}
