// api/create-report.js

import { createClient } from "@supabase/supabase-js";

// IMPORTANT — Vercel environment variables (must be set in Vercel dashboard)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,       // safe URL
  process.env.SUPABASE_SERVICE_ROLE_KEY       // secret key (server only)
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read raw request body
    let raw = "";
    await new Promise(resolve => {
      req.on("data", chunk => (raw += chunk));
      req.on("end", resolve);
    });

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    // Extract fields
    const { email, title, files } = data;

    if (!email || !files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "email + files[] required" });
    }

    // Insert into Supabase table "reports"
    const { data: insert, error } = await supabase
      .from("reports")
      .insert([
        {
          email: email,
          title: title || "Untitled Report",
          file_paths: files,     // store array of files
          status: "queued",
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Database insert failed" });
    }

    return res.status(200).json({
      success: true,
      id: insert.id,
      message: "Report saved & queued"
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
