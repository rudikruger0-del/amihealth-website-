// AMI Health — CBC Upload + Analysis Endpoint
import { pool } from './db.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { patientName, age, sex, values } = req.body;

    if (!values) {
      return res.status(400).json({ error: "Missing CBC values" });
    }

    // Run your Phase 1 AI rules — simplified, extend later
    const interpretation = interpretCBC(values);

    return res.status(200).json({
      success: true,
      patientName,
      interpretation
    });

  } catch (err) {
    console.error("CBC upload error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// === Simple Rules Engine (expand with your Colab model) ===
function interpretCBC(values) {
  const result = {};

  // Hemoglobin
  if (values.Hb < 13) result.Hb = "Low (possible anemia)";
  else result.Hb = "Normal";

  // WBC
  if (values.WBC < 4) result.WBC = "Low — possible leukopenia";
  else if (values.WBC > 11) result.WBC = "High — possible infection";
  else result.WBC = "Normal";

  // Platelets
  if (values.PLT < 150) result.PLT = "Low — risk of bleeding";
  else if (values.PLT > 450) result.PLT = "High — thrombocytosis";
  else result.PLT = "Normal";

  return result;
}
