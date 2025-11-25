import React from "react";

function OrderPanel({ items, onAdd, onRemove }) {
  return (
    <div style={{ padding: "20px", flex: 1 }}>
      <h2>Order Items</h2>

      <div style={{ marginTop: "20px" }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "#f9f9f9",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <div>
              <b>{item.name}</b> × {item.qty}
            </div>

            <div>
              <button onClick={() => onAdd(item)}>+</button>
              <button onClick={() => onRemove(item)}>-</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default OrderPanel;