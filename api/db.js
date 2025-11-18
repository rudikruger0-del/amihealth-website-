import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: "postgresql://postgres:cPtSxtwKbNMoRoQDXZMcsXCyxQQiiACy@switchback.proxy.rlwy.net:18486/railway",
  ssl: {
    rejectUnauthorized: false
  }
});
