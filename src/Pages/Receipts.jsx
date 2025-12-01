import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Receipts() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]); // Initialize with "All"
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [receipt, setReceipt] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch menu items
    axios.get("http://localhost:5000/api/recipe-items")
      .then(res => {
        setMenuItems(res.data);

        // Extract unique categories dynamically from items
        const uniqueCategories = Array.from(new Set(res.data.map(item => item.category)));
        setCategories(["All", ...uniqueCategories]);
      })
      .catch(err => console.error(err));

    // Fetch settings
    axios.get("http://localhost:5000/api/settings")
      .then(res => setSettings(res.data))
      .catch(err => console.error(err));
  }, []);

  // Filter + search logic
  const filteredItems = menuItems
    .filter(item => filter === "All" || item.category === filter)
    .filter(item => {
      if (!search) return true;
      const lower = search.toLowerCase();
      return item.name?.toLowerCase().includes(lower) ||
             (item.itemNumber !== undefined && item.itemNumber.toString().includes(lower));
    });

  // Receipt actions
  const addItem = (item) => setReceipt(prev => {
    const ex = prev.find(p => p._id === item._id);
    if (ex) return prev.map(p => p._id === item._id ? { ...p, qty: p.qty + 1 } : p);
    return [...prev, { ...item, qty: 1 }];
  });

  const decreaseItem = (_id) => setReceipt(prev =>
    prev.map(i => i._id === _id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)
  );

  const deleteItem = (_id) => setReceipt(prev => prev.filter(i => i._id !== _id));

  const totalQty = receipt.reduce((s, i) => s + i.qty, 0);
  const subTotal = receipt.reduce((s, i) => s + i.qty * i.price, 0);
  const GST_PERCENT = settings?.taxPercent || 5;
  const gstAmount = +(subTotal * (GST_PERCENT / 100)).toFixed(2);
  const grandTotal = +(subTotal + gstAmount).toFixed(2);

  const onChargeClick = () => {
    if (!receipt.length) return alert("Add items before charging.");
    setShowPayment(true);
  };

  const onPaySubmit = (e) => {
    e.preventDefault();
    if (!settings) return alert("Settings not loaded");

    const payload = {
      restaurant: {
        name: settings.restaurantName,
        address: settings.address,
        gst: settings.gstNumber
      },
      customer: { name: customerName || "Walk-in", phone: customerPhone || "" },
      payment: { method: paymentMethod },
      items: receipt.map(i => ({ itemId: i._id, name: i.name, qty: i.qty, price: i.price })),
      totals: { totalQty, subTotal, gstAmount, grandTotal, gstPercent: GST_PERCENT },
      date: new Date().toISOString()
    };

    axios.post("http://localhost:5000/api/orders", payload)
      .then(res => navigate("/print", { state: res.data }))
      .catch(err => console.error(err));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Receipts</h1>

      {/* Category Filter */}
      <div className="flex gap-3">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full border ${filter === cat ? "bg-black text-white" : "bg-white"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="mt-3">
        <input
          type="text"
          placeholder="Search by name or number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
          {/* Receipt Panel */}
      <div className="bg-white shadow-xl rounded-xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Receipt Details</h2>
        {receipt.length === 0 ? <p className="text-gray-500">No items added yet.</p> : (
          <div className="space-y-3">
            {receipt.map(item => (
              <div key={item._id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">₹{item.price} × {item.qty} = ₹{item.price*item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => decreaseItem(item._id)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                  <div className="px-3">{item.qty}</div>
                  <button onClick={() => addItem(item)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                  <button onClick={() => deleteItem(item._id)} className="ml-3 px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
              </div>
            ))}

            <div className="border-t pt-3">
              <div className="flex justify-between"><span>Total Quantity:</span><span>{totalQty}</span></div>
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>GST ({GST_PERCENT}%):</span><span>₹{gstAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg mt-2"><span>Grand Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={onChargeClick} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Charge</button>
              <button onClick={() => setReceipt([])} className="bg-gray-200 px-4 py-2 rounded">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {filteredItems.map(item => (
          <div key={item._id} className="bg-white shadow-md rounded-xl p-3 space-y-2">
            <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-32 object-cover rounded-lg"/>
            <h2 className="font-semibold">{item.itemNumber ? item.itemNumber + ". " : ""}{item.name}</h2>
            <p className="text-gray-600">₹{item.price}</p>
            <button onClick={() => addItem(item)} className="px-3 py-1 bg-black text-white rounded">Add</button>
          </div>
        ))}
      </div>

  

      {/* Payment Popup */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Payment & Customer Details</h3>
            <form onSubmit={onPaySubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option>Cash</option>
                  <option>Online Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name (optional)" className="w-full border rounded px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm">Phone</label>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number (optional)" className="w-full border rounded px-3 py-2"/>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-black text-white">Pay & Print</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
