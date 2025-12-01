const express = require("express");
const router = express.Router();
const RecipeItem = require("../models/RecepiesItems");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET All Items
router.get("/", async (req, res) => {
  try {
    const items = await RecipeItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Add Item
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, quantity, category, price, description, tax } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const item = new RecipeItem({
      name,
      quantity,
      category,
      price,
      description,
      tax,
      image: `/uploads/${req.file.filename}`,
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH Update Item
router.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const item = await RecipeItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (req.file && item.image) {
      const oldPath = path.join(__dirname, `..${item.image}`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updatedData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : item.image,
    };

    const updatedItem = await RecipeItem.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE Item
router.delete("/:id", async (req, res) => {
  try {
    const item = await RecipeItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.image) {
      const filePath = path.join(__dirname, `..${item.image}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await RecipeItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Quantity +1
router.post("/:id/increase", async (req, res) => {
  const item = await RecipeItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  item.quantity += 1;
  await item.save();
  res.json(item);
});

// Quantity -1
router.post("/:id/decrease", async (req, res) => {
  const item = await RecipeItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.quantity > 0) item.quantity -= 1;
  await item.save();
  res.json(item);
});

module.exports = router;

