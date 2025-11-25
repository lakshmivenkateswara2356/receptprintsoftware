import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function SummaryPanel() {
  
  const [summary, setSummary] = useState({
    sales: 775,
    expense: 0,
    cash: 775,
    card: 0,
  });

  const [pieData, setPieData] = useState([
    { name: "Cash", value: 775 },
    { name: "Card", value: 0 },
  ]);

  
  const COLORS = ["#e11d74", "#6366F1"];

  
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimate(true), 300);
  }, []);

  return (
    <div className="card p-6 shadow-lg rounded-xl bg-white">
     
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">Summary Details</h3>
        <div className="text-sm text-gray-500">Today</div>
      </div>

     
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
        <div>
          <div className="text-xs text-gray-400">Sales</div>
          <div className="font-semibold">₹{summary.sales}.00</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Expense</div>
          <div className="font-semibold">₹{summary.expense}.00</div>
        </div>
      </div>

     
      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">Payment Summary</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-400">Cash</div>
            <div>₹{summary.cash}.00</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Card</div>
            <div>₹{summary.card}.00</div>
          </div>
        </div>
      </div>

      
      <div className="mt-6 h-56 transition-all duration-700">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={animate ? 90 : 20} 
              dataKey="value"
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default SummaryPanel ;