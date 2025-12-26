import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://receptprintsoftware-2.onrender.com/api";

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

  /* ---------------- FETCH MENU ITEMS ---------------- */
  useEffect(() => {
    axios
      .get(`${API}/recipe-items`)
      .then((res) => {
        const items = res.data || [];
        setMenuItems(items);

        const uniqueCategories = [
          "All",
          ...new Set(items.map((i) => i.category)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => {
        console.error("Menu fetch error:", err);
        alert("Failed to load menu items");
      });
  }, []);

  /* ---------------- FETCH SETTINGS ---------------- */
  useEffect(() => {
    axios
      .get(`${API}/settings`)
      .then((res) => setSettings(res.data || {}))
      .catch((err) => {
        console.error("Settings fetch error:", err);
        alert("Failed to load settings");
      });
  }, []);

  /* ---------------- FILTER MENU ---------------- */
  const filteredItems = menuItems
    .filter((item) => filter === "All" || item.category === filter)
    .filter((item) =>
      search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  /* ---------------- RECEIPT ACTIONS ---------------- */
  const addItem = (item) => {
    setReceipt((prev) => {
      const id = Number(item.id);
      const existing = prev.find((p) => Number(p.id) === id);

      if (existing) {
        return prev.map((p) =>
          Number(p.id) === id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...item, id, qty: 1 }];
    });
  };

  const decreaseItem = (id) => {
    setReceipt((prev) =>
      prev
        .map((i) =>
          Number(i.id) === Number(id)
            ? { ...i, qty: i.qty - 1 }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const deleteItem = (id) => {
    setReceipt((prev) => prev.filter((i) => Number(i.id) !== Number(id)));
  };

  /* ---------------- TOTALS ---------------- */
  const totalQty = receipt.reduce((sum, i) => sum + Number(i.qty || 0), 0);
  const subTotal = receipt.reduce(
    (sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0),
    0
  );

  const GST_PERCENT = Number(settings?.tax_percent || 5);
  const gstAmount = Number((subTotal * GST_PERCENT) / 100).toFixed(2);
  const grandTotal = Number(subTotal + Number(gstAmount)).toFixed(2);

  /* ---------------- PAYMENT ---------------- */
  const onChargeClick = () => {
    if (!receipt.length) {
      alert("Please add items");
      return;
    }
    if (!settings) {
      alert("Settings not loaded");
      return;
    }
    setShowPayment(true);
  };

  const onPaySubmit = async (e) => {
    e.preventDefault();

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
      payment: {
        method: paymentMethod,
      },
      items: receipt.map((i) => ({
        itemId: Number(i.id),
        name: i.name,
        qty: Number(i.qty),
        price: Number(i.price),
      })),
      totals: {
        totalQty: Number(totalQty),
        subTotal: Number(subTotal),
        gstAmount: Number(gstAmount),
        grandTotal: Number(grandTotal),
        gstPercent: GST_PERCENT,
      },
      date: new Date().toISOString(),
    };

    try {
      await axios.post(`${API}/orders`, payload);
      navigate("/print", { state: payload });
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Order failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (

    
    <div className="p-6 space-y-6 ">
      
      <h1 className="text-2xl font-bold">Receipts</h1>

      {/* Categories */}
      <div className="flex gap-3 flex-wrap ">
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
      <input
        className="w-full p-2 border rounded "
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

<div className="flex flex-col justify-between md:flex-row gap-6">
     

      {/* Menu */}
      <div className="grid grid-cols-2 md:grid-cols-7 h-[20px] gap-1">
        {filteredItems.map((item) => (
          <div key={item.id} className="border p-1 rounded">
            <img
              src={item.image}
              alt={item.name}
              className="h-[100px] w-full object-cover"
            />
            <h3 className="font-bold text-xs">{item.name}</h3>
            <p className="text-sm">₹{item.price}</p>
            <button
              onClick={() => addItem(item)}
              className="bg-black text-white text-xs rounded-sm px-3 py-1 mt-2"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Receipt */}
      <div className="bg-white p-4 w-[350px] rounded shadow ">
        <h2 className="font-bold mb-3">Receipt</h2>

        {!receipt.length && <p>No items added</p>}

        {receipt.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <div>
              <b>{item.name}</b>
              <div className="text-sm">
                ₹{item.price} × {item.qty}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <button onClick={() => decreaseItem(item.id)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => addItem(item)}>+</button>
              <button onClick={() => deleteItem(item.id)}>❌</button>
            </div>
          </div>
        ))}

        {!!receipt.length && (
          <>
            <hr />
            <p>Total Qty: {totalQty}</p>
            <p>Subtotal: ₹{subTotal.toFixed(2)}</p>
            <p>GST ({GST_PERCENT}%): ₹{gstAmount}</p>
            <h3 className="font-bold">Total: ₹{grandTotal}</h3>

            <button
              onClick={onChargeClick}
              className="mt-3 w-full bg-green-600 text-white p-2 rounded"
            >
              Charge
            </button>
          </>
        )}
      </div>
    </div>
      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            onSubmit={onPaySubmit}
            className="bg-white p-5 rounded space-y-3"
          >
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border p-2"
            >
              <option>Cash</option>
              <option>Online Payment</option>
            </select>

            <input
              placeholder="Customer Name"
              className="w-full border p-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              placeholder="Phone"
              className="w-full border p-2"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2"
              >
                Pay & Print
              </button>
            </div>
          </form>
        </div>
      )}
    </div>

 
  );
}
