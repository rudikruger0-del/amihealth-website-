// api/create-report.js

import { createClient } from "@supabase/supabase-js";

// Create Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read raw request body
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

    const { email, title, file_path } = data;

    if (!email || !file_path) {
      return res.status(400).json({ error: "Email and file_path required" });
    }

    // Insert into Supabase
    const { error: insertError } = await supabase.from("reports").insert([
      {
        email,
        title: title || "Untitled Report",
        file_path,
        created_at: new Date().toISOString()
      }
    ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ error: "Failed to save report" });
    }

    return res.status(200).json({ success: true, message: "Report saved" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
