// api/register.js
import { pool } from './db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO ami_users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email;
    `;

    const result = await pool.query(query, [email, hashed]);

    return res.status(200).json({
      message: "User registered",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
