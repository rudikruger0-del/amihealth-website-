// api/save-report.js
import pool from './db.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const auth = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!auth) {
    return res.status(401).json({ error: "Missing API key" });
  }

  try {
    const check = await pool.query(
      `SELECT user_id FROM api_keys WHERE api_key = $1 AND active = TRUE LIMIT 1`,
      [auth]
    );

    if (!check.rows.length) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const userId = check.rows[0].user_id;

    const {
      patientName,
      age,
      sex,
      raw_ocr,
      parsed_values,
      interpretations
    } = req.body || {};

    if (!parsed_values || !interpretations) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const q = `
      INSERT INTO reports (
        user_id, patient_name, age, sex,
        raw_ocr, parsed_json, interpretations_json, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
      RETURNING id, created_at
    `;

    const result = await pool.query(q, [
      userId,
      patientName || null,
      age || null,
      sex || null,
      raw_ocr || null,
      JSON.stringify(parsed_values),
      JSON.stringify(interpretations)
    ]);

    res.status(200).json({
      success: true,
      reportId: result.rows[0].id,
      createdAt: result.rows[0].created_at
    });

  } catch (err) {
    console.error("save-report error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
