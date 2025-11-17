// AMI Health — Save Blood Report Endpoint
import { pool } from './db.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { userId, patientName, rawValues, interpretations, redFlags } = req.body;

  try {
    const query = `
      INSERT INTO reports (user_id, patient_name, raw_values, interpretations, red_flags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [
      userId,
      patientName,
      rawValues,
      interpretations,
      redFlags
    ]);

    return res.status(200).json({
      success: true,
      reportId: result.rows[0].id,
      createdAt: result.rows[0].created_at
    });

  } catch (err) {
    console.error("Save report error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
