import { supabase } from "../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";

// --- Function to read raw request body (Vercel fix) ---
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", chunk => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject("Invalid JSON");
      }
    });

    req.on("error", err => reject(err));
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // --- FIX: fully manual JSON body ---
    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON body" });
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

    // --- Compare password with hashed password in DB ---
    const valid = bcrypt.compareSync(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      email: user.email
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
