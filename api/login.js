// AMI Health — Login Endpoint
import { pool } from './db.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, password } = req.body;

  try {
    const query = "SELECT id, email FROM users WHERE email = $1 AND password = crypt($2, password)";
    const result = await pool.query(query, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid login" });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
