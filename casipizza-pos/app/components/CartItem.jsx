export default function CartItem({ item, onRemoveOne, onRemoveAll }) {
  return (
    <div style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#00232F" }}>
      <span style={{ color: "#CA3918", minWidth: "55px", fontWeight: "bold" }}>
        Q.{item.price * item.qty}
      </span>
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        x{item.qty} {item.name.toUpperCase()}
      </span>
      <button onClick={() => onRemoveOne(item.id)} style={btnMinusStyle} title="Restar 1">
        -
      </button>
      <button onClick={() => onRemoveAll(item.id)} style={btnDeleteStyle} title="Eliminar">
        ✕
      </button>
    </div>
  );
}

const btnMinusStyle = {
  background: "#00232F",
  color: "#F8FAE3",
  border: "none",
  borderRadius: "50%",
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};

const btnDeleteStyle = {
  ...btnMinusStyle,
  background: "#CA3918",
  color: "#F8FAE3",
};