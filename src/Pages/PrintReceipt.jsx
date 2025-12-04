
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PrintReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  useEffect(() => {
    if (!data) {
      setTimeout(() => navigate("/receipts"), 1500);
      return;
    }

    const t = setTimeout(() => {
      window.print();
    }, 600);

    return () => clearTimeout(t);
  }, [data, navigate]);

  if (!data) {
    return <div className="p-6">No receipt data. Redirecting...</div>;
  }

  const { restaurant, customer, payment, items, totals, date } = data;

  return (
    <div id="print-area">  
      <div
        className="p-6"
        style={{ maxWidth: 360, margin: "0 auto", background: "#fff" }}
      >
        
        <div className="text-center">
          <h2 className="text-xl font-bold">{restaurant.name}</h2>
          <p >Family Restaurent</p>
          <div className="text-sm">{restaurant.address}</div>
          <div className="text-sm">GST: {restaurant.gst}</div>
        </div>

        <hr className="my-3" />

        <div className="text-sm">
          <div>
            <strong>Receipt Date:</strong> {new Date(date).toLocaleString()}
          </div>
          <div>
            <strong>Customer:</strong> {customer.name || "-"}
          </div>
          <div>
            <strong>Phone:</strong> {customer.phone || "-"}
          </div>
          <div>
            <strong>Payment:</strong> {payment.method}
          </div>
        </div>

        <hr className="my-3" />

        <table style={{ width: "100%", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Item</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.name}</td>
                <td style={{ textAlign: "center" }}>{it.qty}</td>
                <td style={{ textAlign: "right" }}>
                  ₹{(it.price * it.qty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-3" />

        <div style={{ fontSize: 13 }}>
          <div className="flex justify-between">
            <span>Items:</span>
            <span>{totals.totalQty}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{totals.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({totals.gstPercent}%):</span>
            <span>₹{totals.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>₹{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <hr className="my-3" />

        <div className="text-center text-sm">
          <div>Thank you!</div>
          <div>Please visit again</div>
        </div>

        
        <style>
          {`
            @media print {
              body { -webkit-print-color-adjust: exact; }
              @page { margin: 6mm 4mm; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
export default PrintReceipt ;