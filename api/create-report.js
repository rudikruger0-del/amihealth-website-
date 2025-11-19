// api/create-report.js

import { createClient } from "@supabase/supabase-js";

// Create service client (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

    const { title, files, owner_user_email } = data;

    if (!files || files.length === 0 || !owner_user_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // -----------------------------
    // INSERT report entry into DB
    // -----------------------------
    const { data: inserted, error } = await supabase
      .from("reports")
      .insert({
        email: owner_user_email,
        title: title || "Untitled Report",
        file_path: files[0], // Save first file path for now
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save report" });
    }

    return res.status(200).json({
      success: true,
      id: inserted.id
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
