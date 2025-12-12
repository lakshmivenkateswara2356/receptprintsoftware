const db = require("../db");

module.exports = {
  
  // GET first settings row
  getSettings: () => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM settings LIMIT 1", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // CREATE settings
  createSettings: (data) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO settings 
        (restaurant_name, address, gst_number, phone, theme, tax_percent, printer_size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        data.restaurantName,
        data.address,
        data.gstNumber,
        data.phone,
        data.theme || "light",
        data.taxPercent || 2.5,
        data.printerSize || "58mm"
      ];

      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      });
    });
  },

  // UPDATE settings
  updateSettings: (data) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE settings SET
          restaurant_name = ?, 
          address = ?, 
          gst_number = ?, 
          phone = ?, 
          theme = ?, 
          tax_percent = ?, 
          printer_size = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `;

      const params = [
        data.restaurantName,
        data.address,
        data.gstNumber,
        data.phone,
        data.theme,
        data.taxPercent,
        data.printerSize
      ];

      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: 1, ...data });
      });
    });
  }
};
