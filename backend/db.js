// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");

// const dbPath = path.join(__dirname, "../database.sqlite");

// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) console.error("SQLite Error:", err);
//   else console.log("SQLite Connected");
// });


// db.serialize(() => {
//   db.run(`
//     CREATE TABLE IF NOT EXISTS recipe_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       quantity INTEGER NOT NULL DEFAULT 1,
//       category TEXT NOT NULL,
//       price REAL NOT NULL,
//       image TEXT NOT NULL,
//       description TEXT NOT NULL,
//       tax REAL NOT NULL,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     )
//   `);
// });

// module.exports = db;


const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "restaurant_app",
  password: "1417",
  port: 5432,
});

pool.on("connect", () => {
  console.log("PostgreSQL Connected");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};




