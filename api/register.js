import { pool } from "./db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, password]
    );

    return res.status(200).json({
      message: "User registered",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
