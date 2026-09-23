export default function ProductCard({ product, onClick }) {
  const isPremium = product.isPremium;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        backgroundColor: isPremium ? "#CA3918" : "#F8FAE3",
        padding: "1rem 0.75rem",
        borderRadius: "1rem",
        border: isPremium ? "3px solid #4EA3CB" : "2px solid #00232F",
        height: "100%",
        boxShadow: isPremium ? "0 4px 12px rgba(202, 57, 24, 0.4)" : "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "7.5rem",
          aspectRatio: "1/1",
          borderRadius: "50%",
          overflow: "hidden",
          backgroundColor: "#00232F",
          marginBottom: "0.75rem",
          border: isPremium ? "3px solid #F8FAE3" : "3px solid #CA3918",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <span
        style={{
          fontSize: "1.35rem",
          textAlign: "center",
          lineHeight: "1.1",
          color: isPremium ? "#F8FAE3" : "#00232F",
        }}
      >
        {product.name}
      </span>
      <span
        style={{
          fontSize: "1.2rem",
          color: isPremium ? "#F8FAE3" : "#CA3918",
          marginTop: "0.35rem",
          fontWeight: "bold",
        }}
      >
        {typeof product.price === "number" ? `Q.${product.price}` : product.price}
      </span>
    </div>
  );
}