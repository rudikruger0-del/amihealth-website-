{
  "type": "module",
  "dependencies": {
    "pg": "^8.11.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
export default function handler(req, res) {
  return res.status(200).json({
    status: "AMI backend online",
    time: new Date().toISOString()
  });
}
