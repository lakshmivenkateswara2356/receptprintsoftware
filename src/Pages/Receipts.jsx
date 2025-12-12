import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Receipts() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [receipt, setReceipt] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const navigate = useNavigate();

  // Fetch menu items
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/recipe-items")
      .then((res) => {
        const items = res.data || [];
        setMenuItems(items);
        const uniqueCategories = Array.from(new Set(items.map((i) => i.category)));
        setCategories(["All", ...uniqueCategories]);
      })
      .catch((err) => console.error("Menu fetch error:", err));
  }, []);


  // Fetch settings
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/settings")
      .then((res) => setSettings(res.data || {}))
      .catch((err) => console.error("Settings fetch error:", err));

  }, []);

  // Filter + search logic
  const filteredItems = (menuItems || [])
    .filter((item) => filter === "All" || item.category === filter)
    .filter((item) =>
      !search ? true : item.name?.toLowerCase().includes(search.toLowerCase())
    );

  // Receipt actions
  const addItem = (item) =>
    setReceipt((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing)
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: (p.qty || 0) + 1 } : p
        );
      return [...prev, { ...item, qty: 1 }];
    });

  const decreaseItem = (id) =>
    setReceipt((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: (i.qty || 0) - 1 } : i))
        .filter((i) => (i.qty || 0) > 0)
    );

  const deleteItem = (id) => setReceipt((prev) => prev.filter((i) => i.id !== id));

  // Totals safely
  const totalQty = (receipt || []).reduce((sum, i) => sum + (i.qty || 0), 0);
  const subTotal = (receipt || []).reduce(
    (sum, i) => sum + ((i.qty || 0) * (i.price || 0)),
    0
  );
  const GST_PERCENT = settings?.tax_percent || 5;
  const gstAmount = +((subTotal * (GST_PERCENT / 100)) || 0).toFixed(2);
  const grandTotal = +((subTotal + gstAmount) || 0).toFixed(2);

  const onChargeClick = () => {
    if (!receipt.length) return alert("Add items before charging.");
    if (!settings) return alert("Settings are loading, please wait.");
    setShowPayment(true);
  };

  const onPaySubmit = (e) => {
    e.preventDefault();
    if (!settings) return alert("Settings not loaded yet");

    const payload = {
      restaurant: {
        name: settings.restaurant_name || "",
        address: settings.address || "",
        gst: settings.gst_number || "",
      },
      customer: {
        name: customerName || "Walk-in",
        phone: customerPhone || "",
      },
      payment: { method: paymentMethod || "Cash" },
      items: (receipt || []).map((i) => ({
        itemId: i.id,
        name: i.name || "",
        qty: i.qty || 0,
        price: i.price || 0,
      })),
      totals: { totalQty, subTotal, gstAmount, grandTotal, gstPercent: GST_PERCENT },
      date: new Date().toISOString(),
    };


    // Save order to backend
    axios
      .post("http://localhost:5000/api/orders", payload)
      .then(() => {
        // Pass full payload to print page
        navigate("/print", { state: payload });
      })
      .catch((err) => console.error("Payment error:", err));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Receipts</h1>

      {/* Category Filter */}
      <div className="flex gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full border ${
              filter === cat ? "bg-black text-white" : "bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Receipt Panel */}
      <div className="bg-white shadow-xl rounded-xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Receipt Details</h2>
        {!receipt?.length ? (
          <p className="text-gray-500">No items added yet.</p>
        ) : (
          <div className="space-y-3">
            {receipt.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ₹{item.price} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseItem(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <div className="px-3">{item.qty}</div>
                  <button
                    onClick={() => addItem(item)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="ml-3 px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span>Total Quantity:</span>
                <span>{totalQty}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({GST_PERCENT}%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={onChargeClick}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                Charge
              </button>
              <button
                onClick={() => setReceipt([])}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">

        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-xl p-3 space-y-2"
          >
            <img
              src={`http://localhost:5000${item.image || ""}`}
              alt={item.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <h2 className="font-semibold">{item.name}</h2>

            <p className="text-gray-600">₹{item.price}</p>
            <button
              onClick={() => addItem(item)}
              className="px-3 py-1 bg-black text-white rounded"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Payment Popup */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              Payment & Customer Details
            </h3>
            <form onSubmit={onPaySubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option>Cash</option>
                  <option>Online Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Customer Name</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name (optional)"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm">Phone</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-black text-white"
                >
                  Pay & Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
