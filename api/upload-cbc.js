// api/upload-cbc.js
import pool from './db.js';

// Simple interpretation logic (Phase 1)
function interpret(values) {
  const out = {};

  const Hb = Number(values.Hb ?? values.Hemoglobin ?? values.HB);
  const WBC = Number(values.WBC ?? values.WCC ?? values.WhiteCellCount);
  const PLT = Number(values.Platelets ?? values.PLT);

  if (!Number.isNaN(Hb)) {
    out.Hb = Hb < 12 ? "Low (possible anemia)" : "Normal";
  }

  if (!Number.isNaN(WBC)) {
    out.WBC = WBC < 4 ? "Low" : (WBC > 11 ? "High" : "Normal");
  }

  if (!Number.isNaN(PLT)) {
    out.PLT = PLT < 150 ? "Low" : (PLT > 450 ? "High" : "Normal");
  }

  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Verify API key
  const auth = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!auth) {
    return res.status(401).json({ error: "Missing API key" });
  }

  try {
    const checkKey = await pool.query(
      `SELECT user_id FROM api_keys WHERE api_key = $1 AND active = TRUE LIMIT 1`,
      [auth]
    );

    if (!checkKey.rows.length) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const userId = checkKey.rows[0].user_id;

    const { patientName, age, sex, values, raw_ocr } = req.body || {};

    if (!values) {
      return res.status(400).json({ error: "Missing CBC values" });
    }

    const interpretation = interpret(values);

    // Save to DB
    const saveQuery = `
      INSERT INTO reports (
        user_id, patient_name, age, sex, raw_ocr, parsed_json, interpretations_json, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
      RETURNING id, created_at
    `;

    const result = await pool.query(saveQuery, [
      userId,
      patientName || null,
      age || null,
      sex || null,
      raw_ocr || null,
      JSON.stringify(values),
      JSON.stringify(interpretation)
    ]);

    res.status(200).json({
      success: true,
      reportId: result.rows[0].id,
      createdAt: result.rows[0].created_at,
      interpretation
    });

  } catch (err) {
    console.error("upload-cbc error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
