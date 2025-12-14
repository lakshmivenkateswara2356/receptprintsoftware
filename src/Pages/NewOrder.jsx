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
    axios
      .get(API)
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.log("Fetch error:", err));
  };

  // SAFE DATE HANDLER
  const fixDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Order Reports</h2>

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

                  <td className="p-2 border">
                    {fixDate(order.created_at)}
                  </td>

                  <td className="p-2 border">
                    {order.customer_name || "Walk-in"}
                  </td>

                  <td className="p-2 border">
                    {order.payment_method || "N/A"}
                  </td>

                  <td className="p-2 border font-semibold">
                    ₹{order.grand_total}
                  </td>

                  <td className="p-2 border">
                    {order.total_quantity}
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
