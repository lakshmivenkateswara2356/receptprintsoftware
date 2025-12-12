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

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("SQLite Error:", err);
  else console.log("SQLite Connected");
});

// Create Tables
db.serialize(() => {

  // TABLE 1: Recipe Items
  db.run(`
    CREATE TABLE IF NOT EXISTS recipe_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      tax REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABLE 2: Orders
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      restaurant_name TEXT,
      restaurant_address TEXT,
      restaurant_gst TEXT,

      customer_name TEXT,
      customer_phone TEXT,

      payment_method TEXT,

      total_qty INTEGER,
      sub_total REAL,
      gst_percent REAL,
      gst_amount REAL,
      grand_total REAL,

      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABLE 3: Order Items
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,

      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(item_id) REFERENCES recipe_items(id)
    )
  `);

  // SETTINGS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_name TEXT,
    address TEXT,
    gst_number TEXT,
    phone TEXT,
    theme TEXT DEFAULT 'light',
    tax_percent REAL DEFAULT 5,
    printer_size TEXT DEFAULT '58mm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

});

module.exports = db;

