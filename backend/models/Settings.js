const db = require("../db");

module.exports = {
  // GET SETTINGS (single row)
  getSettings: async () => {
    const result = await db.query(
      "SELECT * FROM settings ORDER BY id ASC LIMIT 1"
    );
    return result.rows[0];
  },

  // CREATE SETTINGS
  createSettings: async (data) => {
    const result = await db.query(
      `INSERT INTO settings
      (restaurant_name, address, gst_number, phone, theme, tax_percent, printer_size)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        data.restaurant_name,
        data.address,
        data.gst_number,
        data.phone,
        data.theme,
        data.tax_percent,
        data.printer_size,
      ]
    );
    return result.rows[0];
  },

  // UPDATE SETTINGS (ALWAYS id = 1)
  updateSettings: async (data) => {
    const result = await db.query(
      `UPDATE settings SET
        restaurant_name=$1,
        address=$2,
        gst_number=$3,
        phone=$4,
        theme=$5,
        tax_percent=$6,
        printer_size=$7,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=1
      RETURNING *`,
      [
        data.restaurant_name,
        data.address,
        data.gst_number,
        data.phone,
        data.theme,
        data.tax_percent,
        data.printer_size,
      ]
    );
    return result.rows[0];
  },
};
