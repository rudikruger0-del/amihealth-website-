// api/test.js
export default function handler(req, res) {
  res.status(200).json({ status: "AMI backend online", time: new Date().toISOString() });
}
