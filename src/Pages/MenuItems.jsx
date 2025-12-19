import { useState, useEffect } from "react";

const API_URL = "https://receptprintsoftware-2.onrender.com/api/recipe-items";

/* ===============================
   ADD CATEGORY MODAL
================================ */
function AddCategoryModal({ value, setValue, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-lg font-bold mb-4">Add Category</h2>

        <input
          className="w-full border p-2 mb-4"
          placeholder="Category name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button className="border px-3 py-1" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-black text-white px-3 py-1" onClick={onSave}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   ITEM MODAL
================================ */
function ItemModal({
  title,
  item,
  setItem,
  categories,
  onClose,
  onSave,
  setOpenAddCategory,
}) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <input
          className="w-full border p-2 mb-3"
          placeholder="Item name"
          value={item.name || ""}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
        />

        <select
          className="w-full border p-2 mb-3"
          value={item.category || ""}
          onChange={(e) => {
            if (e.target.value === "__add_new__") {
              setOpenAddCategory(true);
              return;
            }
            setItem({ ...item, category: e.target.value });
          }}
        >
          <option value="">Select Category</option>
          {categories
            .filter((c) => c !== "All")
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          <option value="__add_new__">+ Add New Category</option>
        </select>

        <input
          type="number"
          className="w-full border p-2 mb-3"
          placeholder="Price"
          value={item.price || ""}
          onChange={(e) => setItem({ ...item, price: e.target.value })}
        />

        <input
          className="w-full border p-2 mb-3"
          placeholder="Description"
          value={item.description || ""}
          onChange={(e) =>
            setItem({ ...item, description: e.target.value })
          }
        />

        <input
          type="file"
          accept="image/*"
          className="w-full border p-2 mb-3"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setItem({
                ...item,
                imageFile: file,
                imagePreview: URL.createObjectURL(file),
              });
            }
          }}
        />

        {(item.imagePreview || item.image) && (
          <img
            src={item.imagePreview || item.image}
            alt="preview"
            className="w-32 h-32 object-cover rounded mb-3"
          />
        )}

        <div className="flex justify-end gap-3">
          <button className="border px-3 py-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-black text-white px-3 py-1"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   MAIN COMPONENT
================================ */
export default function MenuItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [openAddItem, setOpenAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState("");

  const emptyItem = {
    name: "",
    quantity: 1,
    category: "",
    price: "",
    description: "",
    tax: 0,
    image: "",
    imageFile: null,
    imagePreview: "",
  };

  const [newItem, setNewItem] = useState(emptyItem);

  /* ===============================
     FETCH
  ================================ */
  const fetchItems = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setItems(data || []);

    const cats = Array.from(new Set((data || []).map((i) => i.category)));
    setCategories(["All", ...cats]);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ===============================
     FORM DATA
  ================================ */
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

  /* ===============================
     ADD / UPDATE / DELETE
  ================================ */
  const handleAddItem = async () => {
    const res = await fetch(API_URL, {
      method: "POST",
      body: buildFormData(newItem),
    });
    const saved = await res.json();
    setItems((prev) => [saved, ...prev]);
    setNewItem(emptyItem);
    setOpenAddItem(false);
  };

  const handleUpdateItem = async () => {
    const res = await fetch(`${API_URL}/${editingItem.id}`, {
      method: "PATCH",
      body: buildFormData(editingItem),
    });
    const updated = await res.json();
    setItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
    setEditingItem(null);
  };

  const handleDeleteItem = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* ===============================
     ADD CATEGORY
  ================================ */
  const handleAddCategory = () => {
    if (!tempCategory.trim()) return;

    setCategories((prev) => [...prev, tempCategory]);

    if (openAddItem) {
      setNewItem((p) => ({ ...p, category: tempCategory }));
    } else if (editingItem) {
      setEditingItem((p) => ({ ...p, category: tempCategory }));
    }

    setTempCategory("");
    setOpenAddCategory(false);
  };

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  /* ===============================
     UI
  ================================ */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <button
          className="bg-black text-white px-4 py-2"
          onClick={() => setOpenAddItem(true)}
        >
          + Add Item
        </button>
      </div>

      <div className="flex gap-3 mb-4 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1 border rounded-full ${
              activeCategory === c ? "bg-black text-white" : ""
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="border p-2 rounded">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-24 object-cover rounded mb-2"
            />
            <h3 className="font-bold text-sm">{item.name}</h3>
            <p className="text-xs">{item.category}</p>

            <div className="flex justify-between text-xs mt-1">
              <span>₹{item.price}</span>
              <span>Qty {item.quantity}</span>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="border px-2 text-xs"
                onClick={() =>
                  setEditingItem({ ...item, imagePreview: "" })
                }
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-2 text-xs"
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {openAddItem && (
        <ItemModal
          title="Add Item"
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
        <AddCategoryModal
          value={tempCategory}
          setValue={setTempCategory}
          onClose={() => setOpenAddCategory(false)}
          onSave={handleAddCategory}
        />
      )}
    </div>
  );
}
