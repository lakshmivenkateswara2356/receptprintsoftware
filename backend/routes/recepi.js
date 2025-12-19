const express = require("express");
const router = express.Router();
const RecipeItem = require("../models/RecepiesItems");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

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
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const newItem = {
      name: req.body.name,
      quantity: req.body.quantity,
      category: req.body.category,
      price: req.body.price,
      description: req.body.description,
      tax: req.body.tax,
      image: req.file.path,          // ✅ Cloudinary URL
      image_id: req.file.filename,   // ✅ Cloudinary public_id
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

    // delete old image if replaced
    if (req.file && existing.image_id) {
      await cloudinary.uploader.destroy(existing.image_id);
    }

    const updated = {
      name: req.body.name || existing.name,
      quantity: req.body.quantity || existing.quantity,
      category: req.body.category || existing.category,
      price: req.body.price || existing.price,
      description: req.body.description || existing.description,
      tax: req.body.tax || existing.tax,
      image: req.file ? req.file.path : existing.image,
      image_id: req.file ? req.file.filename : existing.image_id,
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

    if (item.image_id) {
      await cloudinary.uploader.destroy(item.image_id);
    }

    await RecipeItem.delete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
