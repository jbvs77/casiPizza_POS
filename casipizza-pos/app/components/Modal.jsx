export default function Modal({ isOpen, title, message, type = "info", onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 35, 47, 0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#F8FAE3",
          border: "3px solid #4EA3CB",
          borderRadius: "1rem",
          padding: "1.5rem",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h3 style={{ margin: 0, color: "#CA3918", fontSize: "1.5rem" }}>
          {title || "AVISO"}
        </h3>
        <p style={{ margin: 0, color: "#00232F", fontSize: "1.1rem", fontFamily: "sans-serif" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.5rem" }}>
          {type === "confirm" ? (
            <>
              <button
                onClick={onConfirm}
                style={{
                  backgroundColor: "#CA3918",
                  color: "#F8FAE3",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                CONFIRMAR
              </button>
              <button
                onClick={onCancel}
                style={{
                  backgroundColor: "#00232F",
                  color: "#F8FAE3",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                CANCELAR
              </button>
            </>
          ) : (
            <button
              onClick={onConfirm}
              style={{
                backgroundColor: "#4EA3CB",
                color: "#00232F",
                padding: "0.6rem 1.5rem",
                borderRadius: "0.5rem",
                fontSize: "1.1rem",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              ENTENDIDO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}