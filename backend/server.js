const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let items = [];

// test
app.get("/", (req, res) => {
  res.send("backend data coming...");
});

// GET items
app.get("/items", (req, res) => {
  res.json(items);
});

// ADD item
app.post("/items", (req, res) => {
  const item = req.body;

  if (!item.name || !item.category || !item.price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  item.id = Date.now();
  items.push(item);

  res.json({ message: "Item added successfully", item });
});

const handleDeleteItem = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/items/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    console.log(data.message); // optional: log success message
    // update frontend state
    setItems(items.filter((item) => item.id !== id));
  } catch (error) {
    console.log("Error deleting item:", error);
  }
};


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
