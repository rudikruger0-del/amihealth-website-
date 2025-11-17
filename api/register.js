// api/register.js
import pool from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_secret';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { email, password, displayName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const apiKey = 'AMI_' + crypto.randomBytes(12).toString('hex');

    const insert = `
      INSERT INTO users (email, password_hash, display_name, created_at)
      VALUES ($1, $2, $3, now())
      RETURNING id, email, display_name
    `;
    const r = await pool.query(insert, [email, hashed, displayName || null]);
    const userId = r.rows[0].id;

    await pool.query(
      `INSERT INTO api_keys (user_id, api_key, active, created_at) VALUES ($1, $2, true, now())`,
      [userId, apiKey]
    );

    const token = jwt.sign({ uid: userId, email: r.rows[0].email }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({ success: true, user: r.rows[0], api_key: apiKey, token });
  } catch (err) {
    console.error('register error', err);
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    return res.status(500).json({ error: 'Server error' });
  }
}
