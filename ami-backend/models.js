// models.js
import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const User = sequelize.define("User", {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
});

export const BloodReport = sequelize.define("BloodReport", {
  raw_ocr: { type: DataTypes.TEXT },
  parsed_json: { type: DataTypes.JSON },
  interpretations_json: { type: DataTypes.JSON }
});

User.hasMany(BloodReport, { foreignKey: "user_id" });
BloodReport.belongsTo(User, { foreignKey: "user_id" });

export default { User, BloodReport };
