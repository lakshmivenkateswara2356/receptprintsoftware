const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // use environment variable
  ssl: {
    rejectUnauthorized: false, // required for Render PostgreSQL
  },
});

pool.on("connect", () => {
  console.log("PostgreSQL Connected");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
