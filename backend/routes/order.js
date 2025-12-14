const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/* ================= CREATE ORDER ================= */
router.post("/", async (req, res) => {
  try {
    const result = await Order.createOrder(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Order error:", err);
    res.status(400).json({ message: err.message });
  }
});

/* ================= GET ALL ORDERS ================= */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
