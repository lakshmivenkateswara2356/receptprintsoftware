const express = require("express");
const cors = require("cors");
require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/recipe-items", require("./routes/recipi"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/orders", require("./routes/order"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
