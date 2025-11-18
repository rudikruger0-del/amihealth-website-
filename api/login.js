import { pool } from "./db.js";

export default async function handler(req, res) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    let body = {};

    try {
      body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1 AND password = $2 LIMIT 1",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
