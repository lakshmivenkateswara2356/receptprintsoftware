import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SummaryPanel() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        setOrders(res.data || []); // fallback to empty array
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const recentOrders = (orders || []).slice(0, 5); // always safe

  return (
    <div className="card p-6 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      {recentOrders.length === 0 ? (
        <p className="text-gray-500">No orders available.</p>
      ) : (
        <ul>
          {recentOrders.map((order, idx) => (
            <li key={idx} className="border-b py-2 flex justify-between">
              <span>{order.customer?.name || "Walk-in"}</span>
              <span>₹{order.totals?.grandTotal || 0}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
