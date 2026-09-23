export default function HeaderNav({ activeView, onViewChange }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: "2px solid rgba(248, 250, 227, 0.15)",
        paddingBottom: "12px",
      }}
    >
      {/* Brand Title */}
      <span
        style={{
          fontSize: "22px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#F8FAE3",
        }}
      >
        Casi<span style={{ color: "#CA3918" }}>•</span>Pizza POS
      </span>

      {/* Nav Buttons Container */}
      <div style={{ display: "flex", gap: "8px", backgroundColor: "#001820", padding: "4px", borderRadius: "999px" }}>
        <button
          onClick={() => onViewChange("pos")}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: activeView === "pos" ? "#CA3918" : "transparent",
            color: activeView === "pos" ? "#F8FAE3" : "#4EA3CB",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          POS
        </button>

        <button
          onClick={() => onViewChange("history")}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: activeView === "history" ? "#CA3918" : "transparent",
            color: activeView === "history" ? "#F8FAE3" : "#4EA3CB",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          HISTORIAL
        </button>
      </div>
    </header>
  );
}