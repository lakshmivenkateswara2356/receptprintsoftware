import React from "react";

function Receipt({ items = [], taxPercent = 0 }) {
  // Calculate subtotal
  const subTotal = items.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.price || 0),
    0
  );

  // GST and grand total
  const gstAmount = +(subTotal * (taxPercent / 100)).toFixed(2);
  const grandTotal = +(subTotal + gstAmount).toFixed(2);

  return (
    <div
      style={{
        width: "280px",
        background: "white",
        padding: "20px",
        borderLeft: "1px solid #ddd",
        fontFamily: "sans-serif"
      }}
    >
      <h3>Receipt Preview</h3>
      <hr />

      {items.length === 0 ? (
        <p>No items added</p>
      ) : (
        items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5px 0"
            }}
          >
            <span>{item.name} × {item.qty}</span>
            <span>₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}</span>
          </div>
        ))
      )}

      <hr />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal:</span>
        <span>₹{subTotal.toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>GST ({taxPercent}%):</span>
        <span>₹{gstAmount.toFixed(2)}</span>
      </div>
      <hr />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>Total:</span>
        <span>₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default Receipt;
