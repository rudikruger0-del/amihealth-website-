import { pool } from './db.js';
import bcrypt from 'bcrypt';

export const config = {
  api: {
    bodyParser: false,  // We manually parse JSON now
  },
};

async function readJSON(req) {
  try {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data || "{}");
  } catch (err) {
    return {};
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = await readJSON(req);
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO ami_users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, hashed]
    );

    res.status(200).json({
      message: "User registered",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
