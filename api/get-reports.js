// api/get-reports.js
import pool from './db.js';
import { getUserFromRequest } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET' });

  const auth = await getUserFromRequest(req);
  if (!auth.ok) return res.status(401).json({ error: auth.error || 'Unauthorized' });

  try {
    const userId = auth.userId;
    const q = `SELECT id, patient_name, age, sex, parsed_json, interpretations_json, created_at FROM reports WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200`;
    const r = await pool.query(q, [userId]);
    return res.status(200).json({ success: true, reports: r.rows });
  } catch (err) {
    console.error('get-reports error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
