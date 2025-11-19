// api/create-report.js
export const config = {
  runtime: "edge",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
      });
    }

    // Edge runtime reads JSON like this:
    let data;
    try {
      data = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
      });
    }

    const { email, title, file_path } = data;

    if (!email || !file_path) {
      return new Response(JSON.stringify({ error: "Email and file_path required" }), {
        status: 400,
      });
    }

    const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
    );

    const { error } = await supabase.from("reports").insert([
      {
        email,
        title: title || "Untitled Report",
        file_path,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to save report" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Report saved" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
