const express = require("express");
const router = express.Router();
const RecipeItem = require("../models/RecepiesItems");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ---- Upload Settings ----
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------------------- ROUTES ----------------------

// GET ALL
router.get("/", async (req, res) => {
  try {
    const items = await RecipeItem.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, quantity, category, price, description, tax } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const newItem = {
      name,
      quantity,
      category,
      price,
      description,
      tax,
      image: `/uploads/${req.file.filename}`,
    };

    const saved = await RecipeItem.create(newItem);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE
router.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const existing = await RecipeItem.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Item not found" });

    // Remove old image if replaced
    if (req.file && existing.image) {
      const oldPath = path.join(__dirname, `..${existing.image}`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updated = {
      name: req.body.name || existing.name,
      quantity: req.body.quantity || existing.quantity,
      category: req.body.category || existing.category,
      price: req.body.price || existing.price,
      description: req.body.description || existing.description,
      tax: req.body.tax || existing.tax,
      image: req.file ? `/uploads/${req.file.filename}` : existing.image,
    };

    const result = await RecipeItem.update(req.params.id, updated);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const item = await RecipeItem.getById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.image) {
      const filePath = path.join(__dirname, `..${item.image}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await RecipeItem.delete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// INCREASE
router.post("/:id/increase", async (req, res) => {
  await RecipeItem.increaseQuantity(req.params.id);
  const updated = await RecipeItem.getById(req.params.id);
  res.json(updated);
});

// DECREASE
router.post("/:id/decrease", async (req, res) => {
  await RecipeItem.decreaseQuantity(req.params.id);
  const updated = await RecipeItem.getById(req.params.id);
  res.json(updated);
});

module.exports = router;
