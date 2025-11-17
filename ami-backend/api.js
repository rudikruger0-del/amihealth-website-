import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "./db.js";
import { User, BloodReport } from "./models.js";

await sequelize.sync();

// SECRET — change later
const JWT_SECRET = "AMI_SUPER_SECRET";

export async function signup(req) {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({ email, password_hash: hash });

  return { message: "Signup successful", user_id: user.id };
}

export async function login(req) {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return { message: "Login success", token };
}

export async function saveReport(req) {
  const { user_id, raw_ocr, parsed_json, interpretations_json } = req.body;

  const rep = await BloodReport.create({
    user_id,
    raw_ocr,
    parsed_json,
    interpretations_json,
  });

  return { message: "Report saved", report_id: rep.id };
}

export async function getReports(req) {
  const { user_id } = req.query;

  const reports = await BloodReport.findAll({
    where: { user_id },
    order: [["createdAt", "DESC"]],
  });

  return reports;
}
