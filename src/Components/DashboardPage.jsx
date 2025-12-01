import React, { useEffect, useState } from "react";
import axios from "axios";
import TopCards from "./TopCards";
import SummaryPanel from "./SummaryPanel";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const [dateTime, setDateTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [filter, setFilter] = useState("today");
  const [chartData, setChartData] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const key = "YOUR_API_KEY"; // Replace with your OpenWeather API key
        const city = "Hyderabad";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;
        const res = await axios.get(url);
        setWeather(res.data);
      } catch (err) {
        console.log("Weather error:", err);
      }
    };
    fetchWeather();
  }, []);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  // Generate chart data based on filter
  useEffect(() => {
    if (!orders.length) return;

    const now = new Date();
    let data = [];

    switch (filter) {
      case "today":
        {
          // Group by hour
          const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
          data = hours.map(hour => {
            const sales = orders
              .filter(o => {
                const d = new Date(o.date);
                return (
                  d.getFullYear() === now.getFullYear() &&
                  d.getMonth() === now.getMonth() &&
                  d.getDate() === now.getDate() &&
                  d.getHours() === hour
                );
              })
              .reduce((sum, o) => sum + o.totals.grandTotal, 0);
            return { time: `${hour}:00`, sales };
          });
        }
        break;

      case "yesterday":
        {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const hours = Array.from({ length: 24 }, (_, i) => i);
          data = hours.map(hour => {
            const sales = orders
              .filter(o => {
                const d = new Date(o.date);
                return (
                  d.getFullYear() === yesterday.getFullYear() &&
                  d.getMonth() === yesterday.getMonth() &&
                  d.getDate() === yesterday.getDate() &&
                  d.getHours() === hour
                );
              })
              .reduce((sum, o) => sum + o.totals.grandTotal, 0);
            return { time: `${hour}:00`, sales };
          });
        }
        break;

      case "week":
        {
          // Group by day of current week (Mon-Sun)
          const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const startOfWeek = new Date(now);
          const day = now.getDay(); // Sunday = 0
          startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
          data = weekDays.map((d, idx) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + idx);
            const sales = orders
              .filter(o => {
                const od = new Date(o.date);
                return (
                  od.getFullYear() === date.getFullYear() &&
                  od.getMonth() === date.getMonth() &&
                  od.getDate() === date.getDate()
                );
              })
              .reduce((sum, o) => sum + o.totals.grandTotal, 0);
            return { time: d, sales };
          });
        }
        break;

      case "month":
        {
          // Group by week in current month
          const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
          data = weeks.map((w, idx) => {
            const start = new Date(now.getFullYear(), now.getMonth(), idx * 7 + 1);
            const end = new Date(now.getFullYear(), now.getMonth(), (idx + 1) * 7);
            const sales = orders
              .filter(o => {
                const od = new Date(o.date);
                return od >= start && od <= end;
              })
              .reduce((sum, o) => sum + o.totals.grandTotal, 0);
            return { time: w, sales };
          });
        }
        break;

      default:
        data = [];
    }

    setChartData(data);
  }, [filter, orders]);

  return (
    <div className="p-6 space-y-6">
      {/* Overview Card */}
      <div className="card p-6 bg-gradient-to-r from-pink-400 to-orange-400 text-white">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <div className="flex justify-between mt-4 text-sm">
          <div>
            <p>Date: {dateTime.toLocaleDateString()}</p>
            <p>Time: {dateTime.toLocaleTimeString()}</p>
          </div>
          {weather && (
            <div className="flex items-center gap-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather"
                className="w-12"
              />
              <div>
                <p>{weather.name}</p>
                <p>{weather.main.temp}°C — {weather.weather[0].main}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Cards */}
      <TopCards />

      {/* Sales Graph and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sales Graph</h3>
            <div className="flex gap-2">
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
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={3} />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <SummaryPanel />
      </div>
    </div>
  );
}
