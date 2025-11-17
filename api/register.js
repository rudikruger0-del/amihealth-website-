// api/register.js
import pool from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const apiKey = "AMI_" + crypto.randomBytes(12).toString("hex");

    // Insert user
    const insertUser = `
      INSERT INTO users (email, password_hash, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, email
    `;
    const result = await pool.query(insertUser, [email, hashed]);
    const userId = result.rows[0].id;

    // Insert api key
    await pool.query(
      `INSERT INTO api_keys (user_id, api_key, active, created_at)
       VALUES ($1, $2, TRUE, NOW())`,
      [userId, apiKey]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0],
      api_key: apiKey
    });

  } catch (error) {
    console.error("Register error:", error);

    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
}
