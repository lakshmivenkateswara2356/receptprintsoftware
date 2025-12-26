import React, { useState, useEffect } from "react";
import axios from "axios";

function Card({ title, value, icon }) {
  return (
    <div className="p-6 flex items-center justify-between bg-white shadow rounded-lg">
      <div>
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-2xl font-semibold mt-2">{value}</div>
      </div>
      <div className="text-4xl opacity-40">{icon}</div>
    </div>
  );
}

export default function TopCards() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today"); // today, yesterday, week, month
  const [stats, setStats] = useState({ sales: 0, bills: 0, customers: 0 });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [filter, orders]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://receptprintsoftware-2.onrender.com/api/orders");
      const data = res.data || [];
      // Parse created_at dates safely
      const parsedOrders = data.map((o) => ({
        ...o,
        __parsedDate: o.created_at ? new Date(o.created_at) : null
      }));
      setOrders(parsedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const calculateStats = () => {
    const now = new Date();

    let start, end;

    switch (filter) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      case "yesterday":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week": {
        // Monday to Sunday
        start = new Date(now);
        start.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      }
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start);
    }

    const filteredOrders = orders.filter(
      (o) => o.__parsedDate && o.__parsedDate >= start && o.__parsedDate < end
    );

    const sales = filteredOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
    const bills = filteredOrders.length;
    const customers = new Set(filteredOrders.map((o) => o.customer_name || "Walk-in")).size;

    setStats({ sales, bills, customers });
  };

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {["today", "yesterday", "week", "month"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md capitalize ${
              filter === f ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title={`Total Sales (${filter})`} value={`₹${stats.sales.toFixed(2)}`} icon="📈" />
        <Card title={`Total Bills (${filter})`} value={stats.bills} icon="💵" />
        <Card title={`New Customers (${filter})`} value={stats.customers} icon="👥" />
      </div>
    </div>
  );
}
