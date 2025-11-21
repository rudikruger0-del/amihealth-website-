// api/create-report.js
export const config = { runtime: "nodejs" };
import { createClient } from "@supabase/supabase-js";

// Debug
console.log("SERVICE KEY LOADED?", process.env.SUPABASE_SERVICE_ROLE_KEY ? "YES" : "NO");
console.log("URL:", process.env.SUPABASE_URL);

// Create Supabase client (SERVER SIDE ONLY)
const supabase = createClient(
  process.env.SUPABASE_URL,
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
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { title, files, email } = data;

    if (!files?.length || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: inserted, error } = await supabase
      .from("reports")
      .insert({
        email: email,
        title: title || "Untitled Report",
        file_path: files[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save report" });
    }

    return res.status(200).json({ success: true, id: inserted.id });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
