import React, { useState, useEffect } from "react";
import axios from "axios";

export default function NewOrder() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const API = "http://localhost:5000/api/orders";

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = () => {
    const url = filter === "all" ? API : `${API}/filter?type=${filter}`;

    axios
      .get(url)
      .then((res) => setOrders(res.data))
      .catch((err) => console.log("Fetch error:", err));
  };

  // Convert backend "2025-12-12 03:34:26" → valid JS date
  const fixDate = (d) => new Date(d.replace(" ", "T"));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Order Reports</h2>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-4">
        {["all", "weekly", "monthly", "yearly"].map((f) => (
          <button
            key={f}
            className={`px-4 py-1 rounded-lg border ${
              filter === f ? "bg-black text-white" : ""
            }`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-auto shadow-lg rounded-lg">
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Date & Time</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Payment</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Qty</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className="text-center">
                  <td className="p-2 border">{index + 1}</td>

                  {/* FIXED DATE */}
                  <td className="p-2 border">
                    {fixDate(order.date).toLocaleString()}
                  </td>

                  {/* FIXED CUSTOMER */}
                  <td className="p-2 border">
                    {order.customer_name || "Walk-in"}
                  </td>

                  {/* FIXED PAYMENT */}
                  <td className="p-2 border">
                    {order.payment_method || "N/A"}
                  </td>

                  {/* FIXED TOTAL */}
                  <td className="p-2 border font-semibold">
                    ₹{order.grand_total}
                  </td>

                  {/* FIXED ITEMS → `total_qty` */}
                  <td className="p-2 border">
                    {order.total_qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
