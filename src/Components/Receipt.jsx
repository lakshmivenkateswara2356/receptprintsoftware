import React from "react";

function Receipt({ items }) {
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <div
      style={{
        width: "280px",
        background: "white",
        padding: "20px",
        borderLeft: "1px solid #ddd"
      }}
    >
      <h3>Receipt Preview</h3>
      <hr />

      {items.map((i, index) => (
        <div key={index} style={{ margin: "5px 0" }}>
          {i.name} × {i.qty} — ₹{i.qty * i.price}
        </div>
      ))}

      <hr />
      <h3>Total: ₹{total}</h3>
    </div>
  );
}
export default Receipt ;