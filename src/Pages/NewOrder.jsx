import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://receptprintsoftware-2.onrender.com/api/orders";

export default function NewOrder() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------------- FETCH ORDERS ---------------- */
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setOrders(res.data || []);
    } catch (err) {
      alert("Failed to fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DATE FORMAT ---------------- */
  const fixDate = (d) => (d ? new Date(d).toLocaleString() : "-");

  /* ---------------- DELETE ONE ---------------- */
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      setDeleting(true);
      await axios.delete(`${API}/${id}`);
      fetchOrders();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- DELETE BY FILTER ---------------- */
  const deleteByFilter = async () => {
    if (filter === "all") {
      alert("Select Today / Month / Year");
      return;
    }

    if (!window.confirm(`Delete ${filter.toUpperCase()} orders?`)) return;

    try {
      setDeleting(true);
      await axios.delete(`${API}/filter/${filter}`);
      fetchOrders();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- FILTER ORDERS ---------------- */
  const filteredOrders = orders.filter((o) => {
    const date = new Date(o.created_at);
    const now = new Date();

    if (filter === "today")
      return date.toDateString() === now.toDateString();

    if (filter === "month")
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );

    if (filter === "year")
      return date.getFullYear() === now.getFullYear();

    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Order Reports</h2>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 flex-wrap">
        {["all", "today", "month", "year"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 border rounded ${
              filter === f ? "bg-black text-white" : ""
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}

        <button
          onClick={deleteByFilter}
          disabled={deleting}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Filtered"}
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Payment</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o, i) => (
                <tr key={o.id} className="text-center">
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{fixDate(o.created_at)}</td>
                  <td className="border p-2">
                    {o.customer_name || "Walk-in"}
                  </td>
                  <td className="border p-2">{o.payment_method}</td>
                  <td className="border p-2 font-semibold">
                    ₹{o.grand_total}
                  </td>
                  <td className="border p-2">{o.total_quantity}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteOrder(o.id)}
                      disabled={deleting}
                      className="bg-red-500 text-white px-3 py-1 text-xs rounded disabled:opacity-50"
                    >
                      Delete
                    </button>
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
