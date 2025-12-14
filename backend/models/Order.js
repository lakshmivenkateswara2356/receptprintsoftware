const db = require("../db");

/* ================= GET ALL ORDERS ================= */
const getAllOrders = async () => {
  const result = await db.query(
    "SELECT * FROM orders ORDER BY id DESC"
  );
  return result.rows;
};

/* ================= CREATE ORDER ================= */
const createOrder = async (order) => {
  if (!order || !order.items || !order.totals) {
    throw new Error("Invalid order data");
  }

  const result = await db.query(
    `INSERT INTO orders (
      restaurant_name,
      restaurant_address,
      restaurant_gst,
      customer_name,
      customer_phone,
      payment_method,
      items,
      total_quantity,
      sub_total,
      gst_amount,
      grand_total,
      gst_percent
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id`,
    [
      order.restaurant?.name || "",
      order.restaurant?.address || "",
      order.restaurant?.gst || "",
      order.customer?.name || "Walk-in",
      order.customer?.phone || "",
      order.payment?.method || "Cash",
      JSON.stringify(order.items || []),
      Number(order.totals.totalQty || 0),
      Number(order.totals.subTotal || 0),
      Number(order.totals.gstAmount || 0),
      Number(order.totals.grandTotal || 0),
      Number(order.totals.gstPercent || 0),
    ]
  );

  return { orderId: result.rows[0].id };
};

/* ================= EXPORT PROPERLY ================= */
module.exports = {
  getAllOrders,
  createOrder,
};
