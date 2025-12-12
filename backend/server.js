
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/recipe-items", require("./routes/recepi"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/orders", require("./routes/order"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
