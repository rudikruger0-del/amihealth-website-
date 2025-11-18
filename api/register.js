import { pool } from "./db.js";

export default async function handler(req, res) {
  try {
    // Read raw body (Vercel requires manual parsing)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString() || "{}";

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "email & password required" });
    }

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, password]
    );

    return res.status(200).json({
      message: "User created",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
