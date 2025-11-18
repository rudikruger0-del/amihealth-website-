import { pool } from "./db.js";

export default async function handler(req, res) {
  try {
    // Read raw body for Vercel
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    let body = {};
    try {
      body = JSON.parse(data);
    } catch {}

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "email & password required" });
    }

    // 🔥 IMPORTANT: clean query (NO SPACES BEFORE INSERT)
    const query = `
INSERT INTO users (email, password)
VALUES ($1, $2)
RETURNING id, email;
    `.trim();

    const values = [email, password];

    const result = await pool.query(query, values);

    return res.status(200).json({
      message: "User created",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
