const { Pool } = require("pg");

// Use Render DATABASE_URL in production, fallback to local DB for development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:abcd123@localhost:5432/pos_db",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("PostgreSQL Error:", err);
});

// Export query function for your app
module.exports = {
  query: (text, params) => pool.query(text, params),
};
