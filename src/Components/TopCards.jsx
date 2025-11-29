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
        const orders = res.data;

        const today = new Date();
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.date);
          return (
            orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getDate() === today.getDate()
          );
        });

        const sales = todayOrders.reduce((sum, order) => sum + order.totals.grandTotal, 0);
        const bills = todayOrders.length;

        // Count unique customer names for new customers today
        const customerSet = new Set(todayOrders.map(o => o.customer.name || "Walk-in"));
        setTotalSales(sales);
        setTotalBills(bills);
        

      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Sales Today" value={`₹${totalSales.toFixed(2)}`} icon="📈" />
      <Card title="Total Bills Today" value={totalBills} icon="💵" />
      <Card title="New Customers Today" value={totalBills} icon="👥" />
    </div>
  );
}

export default TopCards;
