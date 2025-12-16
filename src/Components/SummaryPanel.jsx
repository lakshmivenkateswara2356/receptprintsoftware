import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SummaryPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");

        // sort latest first using created_at
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setOrders(sorted);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const recentOrders = orders.slice(0, 5);

  const formatTime = (date) =>
    date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

  return (
    <div className="bg-white shadow rounded-lg p-6 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>

      {loading ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : recentOrders.length === 0 ? (
        <p className="text-gray-500">No orders today.</p>
      ) : (
        <ul className="space-y-3">
          {recentOrders.map((order, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">
                  {order.customer_name || "Walk-in"}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTime(order.created_at)}
                </p>
              </div>

              <p className="font-semibold text-right">
                ₹{order.grand_total ?? 0}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
