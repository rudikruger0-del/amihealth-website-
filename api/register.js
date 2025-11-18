import { pool } from "./db.js";

export default async function handler(req, res) {
  try {
    // Read raw request body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    let body = {};

    try {
      body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, password]
    );

    return res.status(200).json({
      message: "User created",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
