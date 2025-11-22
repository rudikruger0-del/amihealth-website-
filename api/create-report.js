export const config = { runtime: "nodejs" };
import { createClient } from "@supabase/supabase-js";

// Create Supabase client (service key only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
    }
  }
);

export default async function handler(req, res) {
  console.log("🔥 create-report endpoint HIT:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read JSON body
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

    const { email, title, files } = data;

    if (!email || !files?.length) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const filePath = files[0]; // first file only

    // 1️⃣ Insert into Supabase
    const { data: inserted, error: insertErr } = await supabase
      .from("reports")
      .insert({
        email,
        title: title || "Untitled",
        file_path: filePath,
        created_at: new Date().toISOString(),
        ai_status: "processing"
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Supabase Insert Error:", insertErr);
      return res.status(500).json({ error: "Failed to save report" });
    }

    const reportId = inserted.id;

    // 2️⃣ Send file path to AMI AI endpoint
    const aiResponse = await fetch(
      "https://worm-this-tables-touch.trycloudflare.com/analyze",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          file_path: filePath
        })
      }
    );

    let aiJson = null;

    try {
      aiJson = await aiResponse.json();
    } catch {
      aiJson = { error: "Invalid AI response" };
    }

    // 3️⃣ Save AI result in Supabase
    await supabase
      .from("reports")
      .update({
        ai_status: aiJson.error ? "failed" : "complete",
        ai_result: aiJson
      })
      .eq("id", reportId);

    // 4️⃣ Reply to frontend
    return res.status(200).json({
      success: true,
      id: reportId,
      ai: aiJson
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Server-side failure" });
  }
}
