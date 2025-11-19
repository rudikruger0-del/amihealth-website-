// api/login.js
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Use REAL environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Manually read body (Vercel fix)
  let body = "";
  await new Promise(resolve => {
    req.on("data", chunk => (body += chunk));
    req.on("end", resolve);
  });

  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { email, password } = data;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Fetch user securely
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
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

  return res.status(200).json({
    success: true,
    message: "Login successful",
    email: user.email
  });
}
