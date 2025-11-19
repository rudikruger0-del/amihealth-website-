// api/create-report.js

import { createClient } from "@supabase/supabase-js";

// Use your actual Vercel secrets
const supabase = createClient(
  process.env.MY_SUPABASE_URL,
  process.env.MY_SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read raw JSON body
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

    const { email, title, file_path } = data;

    if (!email || !file_path) {
      return res.status(400).json({ error: "Email and file_path required" });
    }

    // Insert into Supabase table
    const { error } = await supabase.from("reports").insert([
      {
        email,
        title: title || "Untitled Report",
        file_path,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save report" });
    }

    return res.status(200).json({ success: true, message: "Report saved" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
