import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/recipe-items";

// Modal for Add/Edit Item
function ItemModal({ title, item, setItem, categories, onClose, onSave, setOpenAddCategory }) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            if (e.target.value === "__add_new__") return setOpenAddCategory(true);
            setItem({ ...item, category: e.target.value });
          }}
        >
          <option value="">Select Category</option>
          {categories.filter(c => c !== "All").map(cat => (
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
          type="text"
          placeholder="Description"
          className="w-full p-2 border rounded mb-3"
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.target.value })}
        />

        <label className="font-semibold block mb-1">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) setItem({ ...item, imageFile: file, image: URL.createObjectURL(file) });
          }}
        />

        {item.image && (
          <img
            src={item.image.startsWith("blob") ? item.image : `http://localhost:5000${item.image}`}
            className="w-32 h-32 object-cover rounded mb-3 border"
            alt=""
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded flex items-center justify-center gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                ></path>
              </svg>
            )}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main MenuItems Component
function MenuItems() {
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState([]);

  const [openAddItem, setOpenAddItem] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    category: "",
    price: "",
    description: "",
    tax: 0,
    imageFile: null,
    image: ""
  });

  const [editingItem, setEditingItem] = useState(null);

  // Fetch items from backend and set dynamic categories
  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);

      const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
      setCategories(["All", ...uniqueCategories]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add new category manually
  const handleAddCategory = () => {
    if (!tempCategory.trim()) return alert("Enter category name");
    setCategories([...categories, tempCategory.trim()]);
    setTempCategory("");
    setOpenAddCategory(false);
  };

  // Convert item to FormData for backend
  const buildFormData = (item) => {
    const fd = new FormData();
    fd.append("name", item.name);
    fd.append("quantity", item.quantity);
    fd.append("category", item.category);
    fd.append("price", item.price);
    fd.append("description", item.description);
    fd.append("tax", item.tax);
    if (item.imageFile) fd.append("image", item.imageFile);
    return fd;
  };

  // Add new item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price || !newItem.imageFile) {
      return alert("Please fill all fields and select an image");
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: buildFormData(newItem),
      });
      const saved = await res.json();
      setItems([...items, saved]);

      if (!categories.includes(saved.category)) {
        setCategories(prev => [...prev, saved.category]);
      }

      setNewItem({ name: "", quantity: 1, category: "", price: "", description: "", tax: 0, imageFile: null, image: "" });
      setOpenAddItem(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete item
  const handleDeleteItem = async (_id) => {
    await fetch(`${API_URL}/${_id}`, { method: "DELETE" });
    setItems(items.filter((i) => i._id !== _id));
  };

  // Update item
  const handleUpdateItem = async () => {
    try {
      const res = await fetch(`${API_URL}/${editingItem._id}`, {
        method: "PATCH",
        body: buildFormData(editingItem),
      });
      const updated = await res.json();
      setItems(items.map(i => i._id === updated._id ? updated : i));

      if (!categories.includes(updated.category)) {
        setCategories(prev => [...prev, updated.category]);
      }

      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <button className="px-4 py-2 bg-black text-white rounded" onClick={() => setOpenAddItem(true)}>+ Add Item</button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-5 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full border ${activeCategory === cat ? "bg-black text-white" : "bg-white text-black"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item._id} className="border rounded-lg p-4 shadow-sm flex flex-col">
            <img src={`http://localhost:5000${item.image}`} className="w-full h-40 object-cover rounded mb-3" alt="" />
            <h2 className="text-lg font-bold">{item.name}</h2>
            <p className="text-sm opacity-70">{item.category}</p>
            <div className="flex justify-between mt-2">
              <span>Qty: {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditingItem(item)} className="px-3 py-1 border rounded">Edit</button>
              <button onClick={() => handleDeleteItem(item._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
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
