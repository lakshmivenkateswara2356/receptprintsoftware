import React, { useEffect, useState } from "react";
import axios from "axios";
import TopCards from "../Components/TopCards";
import SummaryPanel from "../Components/SummaryPanel";
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

  // Fetch weather (optional) - keep as-is (replace API key if you want)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const key = "YOUR_API_KEY"; // Replace with your OpenWeather API key or remove this effect
        const city = "Hyderabad";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;
        const res = await axios.get(url);
        setWeather(res.data);
      } catch (err) {
        // silently fail if no key
        // console.log("Weather error:", err);
      }
    };
    fetchWeather();
  }, []);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        console.log("Fetched orders:", res.data);
        // Normalize/defensive mapping: ensure date field is present and parseable
        const normalized = (res.data || []).map((o) => {
          // backend date example: "2025-12-12 03:34:26"
          let rawDate = o.date || o.created_at || o.createdAt || null;
          let parsedDate = null;
          if (rawDate) {
            // Replace space between date and time with 'T' for safe ISO parsing
            // If it already contains 'T' this will be a no-op.
            const isoLike = String(rawDate).replace(" ", "T");
            parsedDate = new Date(isoLike);
            // Fallback: if invalid date, try direct new Date(raw)
            if (isNaN(parsedDate.getTime())) parsedDate = new Date(rawDate);
          }
          return {
            ...o,
            __parsedDate: parsedDate // keep parsed date for chart filters
          };
        });

        setOrders(normalized);
      } catch (err) {
        console.error("Fetch orders error:", err);
      }
    };
    fetchOrders();
  }, []);

  // Helper to get grand total from backend response
  // Accepts either grand_total (snake_case) OR totals?.grandTotal (old format)
  const safeGrandTotal = (o) => {
    if (!o) return 0;
    if (typeof o.grand_total === "number") return o.grand_total;
    if (o.grandTotal) return o.grandTotal;
    if (o.totals && typeof o.totals.grandTotal === "number") return o.totals.grandTotal;
    // sometimes backend uses "grandTotal" camelCase or other keys
    return Number(o.grand_total) || Number(o.grandTotal) || 0;
  };

  // Generate chart data
  useEffect(() => {
    if (!orders.length) {
      setChartData([]);
      return;
    }

    const now = new Date();
    let data = [];

    switch (filter) {
      case "today": {
        data = Array.from({ length: 24 }, (_, hour) => {
          const sales = orders
            .filter((o) => {
              const d = o.__parsedDate ? o.__parsedDate : new Date(o.date || o.created_at || o.createdAt);
              if (!d || isNaN(d.getTime())) return false;
              return (
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === now.getDate() &&
                d.getHours() === hour
              );
            })
            .reduce((sum, o) => sum + safeGrandTotal(o), 0);
          return { time: `${hour}:00`, sales };
        });
        break;
      }

      case "yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        data = Array.from({ length: 24 }, (_, hour) => {
          const sales = orders
            .filter((o) => {
              const d = o.__parsedDate ? o.__parsedDate : new Date(o.date || o.created_at || o.createdAt);
              if (!d || isNaN(d.getTime())) return false;
              return (
                d.getFullYear() === yesterday.getFullYear() &&
                d.getMonth() === yesterday.getMonth() &&
                d.getDate() === yesterday.getDate() &&
                d.getHours() === hour
              );
            })
            .reduce((sum, o) => sum + safeGrandTotal(o), 0);
          return { time: `${hour}:00`, sales };
        });
        break;
      }

      case "week": {
        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const startOfWeek = new Date(now);
        const day = now.getDay(); // 0 (Sun) - 6 (Sat)
        startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); // Monday start
        data = weekDays.map((label, idx) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + idx);
          const sales = orders
            .filter((o) => {
              const d = o.__parsedDate ? o.__parsedDate : new Date(o.date || o.created_at || o.createdAt);
              if (!d || isNaN(d.getTime())) return false;
              return (
                d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate()
              );
            })
            .reduce((sum, o) => sum + safeGrandTotal(o), 0);
          return { time: label, sales };
        });
        break;
      }

      case "month": {
        const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
        data = weeks.map((w, idx) => {
          const start = new Date(now.getFullYear(), now.getMonth(), idx * 7 + 1);
          // set end to last day of that 7-day block (clamp to month end naturally)
          const end = new Date(now.getFullYear(), now.getMonth(), (idx + 1) * 7 + 1);
          const sales = orders
            .filter((o) => {
              const d = o.__parsedDate ? o.__parsedDate : new Date(o.date || o.created_at || o.createdAt);
              if (!d || isNaN(d.getTime())) return false;
              return d >= start && d < end;
            })
            .reduce((sum, o) => sum + safeGrandTotal(o), 0);
          return { time: w, sales };
        });
        break;
      }

      default:
        data = [];
    }

    setChartData(data);
  }, [filter, orders]);

  return (
    <div className="p-6 space-y-6">
      <div className="card p-6 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded">
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

      <TopCards orders={orders} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 bg-white rounded shadow">
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
                <CartesianGrid stroke="#eee" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <SummaryPanel orders={orders} />
      </div>
    </div>
  );
}
