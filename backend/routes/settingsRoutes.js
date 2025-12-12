const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// GET Settings
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE or UPDATE Settings
router.post("/", async (req, res) => {
  try {
    const existing = await Settings.getSettings();

    if (existing) {
      const updated = await Settings.updateSettings(req.body);
      return res.json(updated);
    }

    const created = await Settings.createSettings(req.body);
    res.json(created);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
