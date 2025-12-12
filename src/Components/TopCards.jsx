import React, { useState, useEffect } from "react";
import axios from "axios";

function Card({ title, value, icon }) {
  return (
    <div className="card p-6 flex items-center justify-between bg-white shadow rounded-lg">
      <div>
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-2xl font-semibold mt-2">{value}</div>
      </div>
      <div className="text-4xl opacity-40">{icon}</div>
    </div>
  );
}

function TopCards() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        const orders = res.data || [];

        const parseDate = (str) => (str ? new Date(str.replace(" ", "T")) : null);

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const todayOrders = orders.filter((o) => {
          const d = parseDate(o.date);
          return d && d >= start && d <= end;
        });

        // FIXED: using backend's grand_total field
        const sales = todayOrders.reduce(
          (sum, o) => sum + Number(o.grand_total || 0),
          0
        );

        const bills = todayOrders.length;
        const customerSet = new Set(todayOrders.map((o) => o.customer?.name || "Walk-in"));

        setTotalSales(sales);
        setTotalBills(bills);
        setNewCustomers(customerSet.size);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Sales Today" value={`₹${totalSales.toFixed(2)}`} icon="📈" />
      <Card title="Total Bills Today" value={totalBills} icon="💵" />
      <Card title="New Customers Today" value={newCustomers} icon="👥" />
    </div>
  );
}

export default TopCards;
