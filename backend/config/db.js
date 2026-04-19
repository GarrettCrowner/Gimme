// server/config/db.js
const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "skins_tracker",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
});

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
  process.exit(-1);
});

// Convenience query wrapper
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("query", { text, duration, rows: res.rowCount });
  }
  return res;
}

module.exports = { query, pool };
