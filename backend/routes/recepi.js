const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const RecipeItem = require("../models/RecepiesItems");

const uploadDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET all
router.get("/", async (req, res) => {
  try {
    const items = await RecipeItem.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new
router.post("/", upload.single("image"), async (req, res) => {
  const { name, quantity, category, price, description, tax } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  const newItem = new RecipeItem({ name, quantity, category, price, description, tax, image });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update
router.patch("/:id", upload.single("image"), async (req, res) => {
  const { name, quantity, category, price, description, tax } = req.body;
  const updateData = { name, quantity, category, price, description, tax };
  if (req.file) updateData.image = `/uploads/${req.file.filename}`;

  try {
    const updatedItem = await RecipeItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await RecipeItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// INCREASE quantity
router.patch("/:id/increase", async (req, res) => {
  try {
    const item = await RecipeItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.quantity += 1;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DECREASE quantity
router.patch("/:id/decrease", async (req, res) => {
  try {
    const item = await RecipeItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.quantity > 0) item.quantity -= 1;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
