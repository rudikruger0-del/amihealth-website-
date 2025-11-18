import { supabase } from "../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // --- Fix: Manually read raw request body (Vercel requirement) ---
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }

    let body;
    try {
      body = JSON.parse(Buffer.concat(buffers).toString());
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // --- Fetch user from Supabase ---
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // --- Fix: compare with password_hash column ---
    const valid = bcrypt.compareSync(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      email: user.email,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
