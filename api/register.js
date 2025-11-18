import { pool } from "./db.js";

export default async function handler(req, res) {
  try {
    // Parse JSON body manually (important on Vercel)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    let body = {};
    try {
      body = JSON.parse(data);
    } catch {
      // ignore, body will stay {}
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "email & password required" });
    }

    const query = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email`;
    const values = [email, password];

    const result = await pool.query(query, values);

    return res.status(200).json({
      message: "User created",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
