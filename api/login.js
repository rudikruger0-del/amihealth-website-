import { supabase } from "../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = "";
  await new Promise(resolve => {
    req.on("data", chunk => (body += chunk));
    req.on("end", resolve);
  });

  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { email, password } = data;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // GET USER
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // CHECK PASSWORD
  const valid = bcrypt.compareSync(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  return res.status(200).json({
    success: true,
    email: user.email
  });
}
