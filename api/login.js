import { supabase } from "../../lib/supabaseClient.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check user in Supabase
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const bcrypt = require("bcryptjs");
    const validPassword = bcrypt.compareSync(password, data.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({ success: true, message: "Login successful" });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
