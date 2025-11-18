// api/login.js
import { supabase } from "../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Manually parse body (Vercel fix)
    let rawBody = "";
    for await (const chunk of req) {
      rawBody += chunk;
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Query Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("email, password_hash")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const valid = bcrypt.compareSync(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      email: user.email,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
