const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const result = await Order.createOrder(req.body);
    res.status(201).json({ orderId: result.orderId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET ALL ORDERS
router.get("/", async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FILTER ORDERS
router.get("/filter", async (req, res) => {
  try {
    const orders = await Order.filterOrders(req.query.type);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ORDER ITEMS
router.get("/:id/items", async (req, res) => {
  try {
    const items = await Order.getOrderItems(req.params.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
