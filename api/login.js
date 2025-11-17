// api/login.js
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_secret';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  try {
    const q = `SELECT id, email, password_hash, display_name FROM users WHERE email = $1`;
    const r = await pool.query(q, [email]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const k = await pool.query(`SELECT api_key FROM api_keys WHERE user_id=$1 AND active=true LIMIT 1`, [user.id]);
    const api_key = k.rows.length ? k.rows[0].api_key : null;

    const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ success: true, user: { id: user.id, email: user.email, display_name: user.display_name }, api_key, token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
