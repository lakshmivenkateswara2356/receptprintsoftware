import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Veg", "Non-Veg", "Starters"];

function Receipts() {
  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [receipt, setReceipt] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const navigate = useNavigate();

  // 👉 Fetch menu items from backend API
  useEffect(() => {
    axios
      .get("http://localhost:5000/Items")
      .then((res) => setMenuItems(res.data))
      .catch((err) => console.log("Error fetching menu:", err));
  }, []);

  // Filter items
  const filteredItems =
    filter === "All"
      ? menuItems
      : menuItems.filter((i) => i.category === filter);

  const addItem = (item) => {
    setReceipt((prev) => {
      const ex = prev.find((p) => p.id === item.id);
      if (ex)
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const decreaseItem = (id) => {
    setReceipt((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const deleteItem = (id) => setReceipt((prev) => prev.filter((i) => i.id !== id));

  const totalQty = receipt.reduce((s, i) => s + i.qty, 0);
  const subTotal = receipt.reduce((s, i) => s + i.qty * i.price, 0);
  const GST_PERCENT = 5;
  const gstAmount = +(subTotal * (GST_PERCENT / 100)).toFixed(2);
  const grandTotal = +(subTotal + gstAmount).toFixed(2);

  const onChargeClick = () => {
    if (receipt.length === 0) {
      alert("Add items before charging.");
      return;
    }
    setShowPayment(true);
  };

  const onPaySubmit = (e) => {
    e.preventDefault();

    const payload = {
      restaurant: {
        name: "ALANKAR",
        address: "123 MG Road, YourCity - 500001",
        gst: "29ABCDE1234F2Z5",
      },
      customer: {
        name: customerName || "Walk-in",
        phone: customerPhone || "",
      },
      payment: { method: paymentMethod },
      items: receipt,
      totals: { totalQty, subTotal, gstAmount, grandTotal, gstPercent: GST_PERCENT },
      date: new Date().toISOString(),
    };

    navigate("/print", { state: payload });
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

      {/* Menu Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.length === 0 ? (
          <p>No items available.</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-xl p-3 space-y-2"
            >
              <img
                src={item.image}
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
          ))
        )}
      </div>

      {/* Receipt Panel */}
      <div className="bg-white shadow-xl rounded-xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Receipt Details</h2>

        {receipt.length === 0 ? (
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
                    ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
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
                <div>Total Quantity:</div>
                <div>{totalQty}</div>
              </div>
              <div className="flex justify-between">
                <div>Subtotal:</div>
                <div>₹{subTotal.toFixed(2)}</div>
              </div>
              <div className="flex justify-between">
                <div>GST (5%):</div>
                <div>₹{gstAmount.toFixed(2)}</div>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <div>Grand Total:</div>
                <div>₹{grandTotal.toFixed(2)}</div>
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
                onClick={() => {
                  setReceipt([]);
                }}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Clear
              </button>
            </div>
          </div>
        )}
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
                  className="w-full border rounded px-3 py-2"
                  placeholder="Customer name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm">Phone</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Phone number (optional)"
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
export default Receipts;
