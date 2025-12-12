const db = require("../db");

module.exports = {

  // -------------------- CREATE ORDER --------------------
  createOrder: (orderData) => {
    return new Promise((resolve, reject) => {
      const {
        restaurant,
        customer,
        payment,
        items,
        totals,
      } = orderData;

      const sql = `
        INSERT INTO orders 
        (
          restaurant_name, restaurant_address, restaurant_gst,
          customer_name, customer_phone,
          payment_method,
          total_qty, sub_total, gst_percent, gst_amount, grand_total
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        restaurant.name,
        restaurant.address,
        restaurant.gst,
        customer.name,
        customer.phone,
        payment.method,
        totals.totalQty,
        totals.subTotal,
        totals.gstPercent,
        totals.gstAmount,
        totals.grandTotal,
      ];

      db.run(sql, params, function (err) {
        if (err) return reject(err);

        const orderId = this.lastID;

        // Insert multiple order items
        const itemSql = `
          INSERT INTO order_items (order_id, item_id, name, qty, price)
          VALUES (?, ?, ?, ?, ?)
        `;

        items.forEach((i) => {
          db.run(itemSql, [orderId, i.itemId, i.name, i.qty, i.price]);
        });

        resolve({ orderId });
      });
    });
  },

  // -------------------- GET ALL ORDERS --------------------
  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // -------------------- GET ORDER ITEMS --------------------
  getOrderItems: (orderId) => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM order_items WHERE order_id = ?",
        [orderId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // -------------------- FILTER BY DATE --------------------
  filterOrders: (type) => {
    let sql = `
      SELECT * FROM orders 
      WHERE date >= datetime('now', ?)
      ORDER BY date DESC
    `;

    let range = "0 days";

    if (type === "weekly") range = "-7 days";
    if (type === "monthly") range = "-1 month";
    if (type === "yearly") range = "-1 year";

    return new Promise((resolve, reject) => {
      db.all(sql, [range], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
