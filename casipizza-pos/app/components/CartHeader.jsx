import CartItem from "./CartItem";

export default function CartHeader({ totalAmount, cart, onRemoveOne, onRemoveAll }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
        backgroundColor: "#F8FAE3",
        padding: "16px",
        borderRadius: "16px",
        margin: "16px 0",
      }}
    >
      <div>
        <div style={{ fontSize: "24px", color: "#00232F" }}>TOTAL:</div>
        <div style={{ fontSize: "36px", color: "#CA3918", marginTop: "2px" }}>
          Q.{totalAmount}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
        {cart.length === 0 ? (
          <div style={{ color: "#00232F", opacity: 0.5, fontSize: "16px" }}>
            SIN PRODUCTOS
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemoveOne={onRemoveOne}
              onRemoveAll={onRemoveAll}
            />
          ))
        )}
      </div>
    </div>
  );
}