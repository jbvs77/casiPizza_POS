export default function ActionButton({ label, onClick, variant = "default", disabled = false }) {
  let bgColor = "#4EA3CB"; // 10% Secundario 1
  let textColor = "#00232F";

  if (variant === "primary") {
    bgColor = "#CA3918"; // 30% Primario
    textColor = "#F8FAE3";
  } else if (variant === "neutral") {
    bgColor = "#F8FAE3"; // 10% Secundario 2
    textColor = "#00232F";
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "14px 20px",
        borderRadius: "999px",
        fontSize: "22px",
        backgroundColor: bgColor,
        color: textColor,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        width: "100%",
      }}
    >
      {label}
    </button>
  );
}