import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PrintReceipt() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from location.state or localStorage fallback
  const data = location.state || JSON.parse(localStorage.getItem("lastReceipt"));

  useEffect(() => {
    if (!data) {
      const t = setTimeout(() => navigate("/receipts"), 1500);
      return () => clearTimeout(t);
    }

    localStorage.setItem("lastReceipt", JSON.stringify(data));
    const printTimeout = setTimeout(() => window.print(), 600);
    return () => clearTimeout(printTimeout);
  }, [data, navigate]);

  if (!data) {
    return <div className="p-6 text-center">No receipt data. Redirecting...</div>;
  }

  const { restaurant, customer, payment, items, totals, date } = data;

  return (
    <div id="print-area">
      <div
        className="p-6"
        style={{ maxWidth: 360, margin: "0 auto", background: "#fff" }}
      >
        {/* Restaurant Info */}
        <div className="text-center">
          <h2 className="text-xl font-bold">{restaurant?.name || "Restaurant Name"}</h2>
          <div className="text-sm">{restaurant?.address || "-"}</div>
          <div className="text-sm">GST: {restaurant?.gst || "-"}</div>
        </div>

        <hr className="my-3" />

        {/* Customer & Payment */}
        <div className="text-sm">
          <div><strong>Date:</strong> {date ? new Date(date).toLocaleString() : "-"}</div>
          <div><strong>Customer:</strong> {customer?.name || "Walk-in"}</div>
          <div><strong>Phone:</strong> {customer?.phone || "-"}</div>
          <div><strong>Payment:</strong> {payment?.method || "-"}</div>
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
