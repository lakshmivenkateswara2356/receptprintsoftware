import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_SETTINGS = "https://receptprintsoftware-2.onrender.com/api/settings";

export default function PrintReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const [restaurantSettings, setRestaurantSettings] = useState(null);

  // Get data from location.state or localStorage fallback
  const data = location.state || JSON.parse(localStorage.getItem("lastReceipt"));

  useEffect(() => {
    if (!data) {
      const t = setTimeout(() => navigate("/receipts"), 1500);
      return () => clearTimeout(t);
    }

    // Save last receipt
    localStorage.setItem("lastReceipt", JSON.stringify(data));

    // Fetch restaurant settings for phone, GST, etc.
    const fetchSettings = async () => {
      try {
        const res = await axios.get(API_SETTINGS);
        if (res.data) {
          setRestaurantSettings({
            name: res.data.restaurant_name || "Restaurant Name",
            address: res.data.address || "-",
            phone: res.data.phone || "-",
            gst: res.data.gst_number || "-",
          });
        }
      } catch (err) {
        console.error("Failed to fetch restaurant settings", err);
      }
    };
    fetchSettings();

    const printTimeout = setTimeout(() => window.print(), 600);
    return () => clearTimeout(printTimeout);
  }, [data, navigate]);

  if (!data) {
    return <div className="p-6 text-center">No receipt data. Redirecting...</div>;
  }

  const { customer, payment, items, totals, date } = data;
  const restaurant = restaurantSettings || data.restaurant;

  return (
    <div id="print-area">
      <div
        className="p-6"
        style={{ maxWidth: 360, margin: "0 auto", background: "#fff" }}
      >
        {/* Restaurant Info */}
        <div className="text-center">
          <h2
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: '"Dancing Script", cursive' }}
          >
            {restaurant?.name || "Restaurant Name"}
          </h2>
          <p>Family Restaurant</p>
          <div className="text-sm">{restaurant?.address || "-"}</div>
          <div className="text-sm">Phone: {restaurant?.phone || "-"}</div>
          <div className="text-sm">GST: {restaurant?.gst || "-"}</div>
        </div>

        <hr className="my-3" />

        {/* Customer & Payment */}
        <div className="text-sm">
          <div>
            <strong>Date:</strong> {date ? new Date(date).toLocaleString() : "-"}
          </div>
          <div>
            <strong>Customer:</strong> {customer?.name || "Walk-in"}
          </div>
          <div>
            <strong>Payment:</strong> {payment?.method || "-"}
          </div>
        </div>

        <hr className="my-3" />

        {/* Items */}
        <table style={{ width: "100%", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Item</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((it, idx) => (
              <tr key={idx}>
                <td>{it?.name || "-"}</td>
                <td style={{ textAlign: "center" }}>{it?.qty || 0}</td>
                <td style={{ textAlign: "right" }}>₹{(it?.price * it?.qty || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-3" />

        {/* Totals */}
        <div style={{ fontSize: 13 }}>
          <div className="flex justify-between">
            <span>Items:</span>
            <span>{totals?.totalQty || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{totals?.subTotal?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({totals?.gstPercent || 0}%):</span>
            <span>₹{totals?.gstAmount?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>₹{totals?.grandTotal?.toFixed(2) || "0.00"}</span>
          </div>
        </div>

        <hr className="my-3" />

        <div className="text-center text-sm">
          <div>Thank you!</div>
          <div>Please visit again</div>
        </div>

        <style>{`
          @media print {
            body { -webkit-print-color-adjust: exact; }
            @page { margin: 6mm 4mm; }
          }
        `}</style>
      </div>
    </div>
  );
}
