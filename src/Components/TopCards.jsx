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
  const [totalSales, setTotalSales] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      const orders = res.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayOrders = orders.filter((o) => {
        if (!o.created_at) return false;
        const orderDate = new Date(o.created_at);
        return orderDate >= today && orderDate < tomorrow;
      });

      // ✅ FIXED TOTAL SALES
      const sales = todayOrders.reduce(
        (sum, o) => sum + Number(o.grand_total || 0),
        0
      );

      // ✅ FIXED TOTAL BILLS
      const bills = todayOrders.length;

      // ✅ FIXED CUSTOMERS (flat column)
      const customers = new Set(
        todayOrders.map((o) => o.customer_name || "Walk-in")
      );

      setTotalSales(sales);
      setTotalBills(bills);
      setNewCustomers(customers.size);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Sales Today" value={`₹${totalSales.toFixed(2)}`} icon="📈" />
      <Card title="Total Bills Today" value={totalBills} icon="💵" />
      <Card title="New Customers Today" value={newCustomers} icon="👥" />
    </div>
  );
}
