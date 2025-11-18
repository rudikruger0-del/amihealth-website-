import { sql } from "./db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Insert new user
    const result = await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${password})
      RETURNING id, email, created_at;
    `;

    return res.status(200).json({
      message: "User registered successfully",
      user: result[0],
    });

  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: err.message });
  }
}
