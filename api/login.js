import { supabase } from "../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;

    let email, password;

    try {
      email = body.email;
      password = body.password;
    } catch (e) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Fetch user from Supabase
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const valid = bcrypt.compareSync(password, data.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Login successful", email: data.email });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
