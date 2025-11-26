import { useState, useEffect } from "react";

// Item Modal Component
function ItemModal({ title, item, setItem, categories, onClose, onSave, setOpenAddCategory }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <input
          type="text"
          placeholder="Item Name"
          className="w-full p-2 border rounded mb-3"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
        />

        <select
          className="w-full p-2 border rounded mb-3"
          value={item.category}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "__add_new__") {
              setOpenAddCategory(true);
              return;
            }
            setItem({ ...item, category: value });
          }}
        >
          <option value="">Select Category</option>
          {categories.filter((c) => c !== "All").map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="__add_new__">+ Add New Category</option>
        </select>

        <input
          type="number"
          placeholder="Price"
          className="w-full p-2 border rounded mb-3"
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
        />

        <input
          type="number"
          placeholder="Discount (%)"
          className="w-full p-2 border rounded mb-3"
          value={item.discount}
          onChange={(e) => setItem({ ...item, discount: e.target.value })}
        />

        <label className="font-semibold block mb-1">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const preview = URL.createObjectURL(file);
              setItem({ ...item, image: preview });
            }
          }}
        />

        {item.image && (
          <img
            src={item.image}
            className="w-32 h-32 object-cover rounded mb-3 border"
            alt=""
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-black text-white rounded" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function MenuItems() {
  const [categories, setCategories] = useState(["All", "Veg", "Non-Veg", "Starters"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState([]);

  const [openAddItem, setOpenAddItem] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: "",
    discount: "",
    image: "",
  });

  const [editingItem, setEditingItem] = useState(null);

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add Category
  const handleAddCategory = () => {
    if (!tempCategory.trim()) return alert("Please enter category name");
    setCategories([...categories, tempCategory.trim()]);
    setTempCategory("");
    setOpenAddCategory(false);
  };

  // Add Item (POST)
  const handleAddItem = async () => {
    if (!newItem.name.trim()) return alert("Enter item name");
    if (!newItem.category.trim()) return alert("Select category");
    if (!newItem.price || Number(newItem.price) <= 0) return alert("Enter valid price");

    const itemObj = {
     
      name: newItem.name,
      category: newItem.category,
      price: Number(newItem.price),
      discount: Number(newItem.discount || 0),
      image: newItem.image,
    };

    const res = await fetch("http://localhost:5000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemObj),
    });

    const data = await res.json();
    setItems([...items, data.item]);
    resetItemForm();
    setOpenAddItem(false);
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    await fetch(`http://localhost:5000/items/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
  };

  // Update Item
  const handleUpdateItem = async () => {
    const updatedList = items.map((it) =>
      it.id === editingItem.id ? editingItem : it
    );
    setItems(updatedList);
    setEditingItem(null);
  };

  const resetItemForm = () => {
    setNewItem({ name: "", category: "", price: "", discount: "", image: "" });
  };

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <button onClick={() => setOpenAddItem(true)} className="px-4 py-2 bg-black text-white rounded">+ Add Item</button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-5 overflow-x-auto">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full border ${activeCategory === cat ? "bg-black text-white" : "bg-white text-black"}`}>
            {cat}
          </button>
        ))}
        <button onClick={() => setOpenAddCategory(true)} className="px-4 py-2 bg-green-600 text-white rounded-full">+ Add Category</button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
            <img src={item.image} className="w-full h-40 object-cover rounded mb-3" alt="" />
            <h2 className="text-lg font-bold">{item.name}</h2>
            <p className="text-sm opacity-70">{item.category}</p>
            <div className="flex justify-between mt-2">
              <span>₹{item.price}</span>
              {item.discount > 0 && <span className="text-green-600">{item.discount}% OFF</span>}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingItem(item)} className="px-3 py-1 border rounded">Edit</button>
              <button onClick={() => handleDeleteItem(item.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modals */}
      {openAddItem && (
        <ItemModal
          title="Add New Item"
          item={newItem}
          setItem={setNewItem}
          categories={categories}
          onClose={() => setOpenAddItem(false)}
          onSave={handleAddItem}
          setOpenAddCategory={setOpenAddCategory}
        />
      )}
      {editingItem && (
        <ItemModal
          title="Edit Item"
          item={editingItem}
          setItem={setEditingItem}
          categories={categories}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItem}
          setOpenAddCategory={setOpenAddCategory}
        />
      )}

      {openAddCategory && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-5 w-80 rounded">
            <h2 className="font-bold mb-3 text-lg">Add Category</h2>
            <input
              type="text"
              placeholder="Category Name"
              className="w-full p-2 border rounded mb-3"
              value={tempCategory}
              onChange={(e) => setTempCategory(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded" onClick={() => setOpenAddCategory(false)}>Cancel</button>
              <button className="px-4 py-2 bg-black text-white rounded" onClick={handleAddCategory}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuItems;
