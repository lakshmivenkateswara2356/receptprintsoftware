const db = require("../db");

// GET ALL
exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM recipe_items", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// CREATE
exports.create = (item) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO recipe_items 
      (name, quantity, category, price, image, description, tax, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const params = [
      item.name,
      item.quantity,
      item.category,
      item.price,
      item.image,
      item.description,
      item.tax
    ];

    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...item });
    });
  });
};

// GET BY ID
exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM recipe_items WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// UPDATE
exports.update = (id, data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE recipe_items SET
      name = ?, quantity = ?, category = ?, price = ?, image = ?, description = ?, tax = ?, 
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      sql,
      [
        data.name,
        data.quantity,
        data.category,
        data.price,
        data.image,
        data.description,
        data.tax,
        id,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ id, ...data });
      }
    );
  });
};

// DELETE
exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM recipe_items WHERE id = ?", [id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// INCREASE quantity
exports.increaseQuantity = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE recipe_items SET quantity = quantity + 1 WHERE id = ?
    `, [id], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

// DECREASE quantity
exports.decreaseQuantity = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE recipe_items SET quantity = CASE 
        WHEN quantity > 0 THEN quantity - 1 
        ELSE 0 END 
      WHERE id = ?
    `, [id], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};
