const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/* ================= DELETE BY DATE FILTER ================= */
router.delete("/filter/:type", async (req, res) => {
  try {
    await Order.deleteOrdersByFilter(req.params.type);
    res.json({ message: "Orders deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ================= DELETE SINGLE ORDER ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Order.deleteOrderById(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= CREATE ORDER ================= */
router.post("/", async (req, res) => {
  try {
    const result = await Order.createOrder(req.body);
    res.status(201).json(result);
  } catch (err) {
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
