// api/login.js
import pool from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const q = `SELECT id, email, password_hash FROM users WHERE email = $1`;
    const r = await pool.query(q, [email]);

    if (!r.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch API key
    const apiKeyReq = await pool.query(
      `SELECT api_key FROM api_keys WHERE user_id = $1 AND active = TRUE LIMIT 1`,
      [user.id]
    );

    const api_key = apiKeyReq.rows.length ? apiKeyReq.rows[0].api_key : null;

    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email },
      api_key
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
