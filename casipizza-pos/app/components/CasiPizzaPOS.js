"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------
// MENÚ — editá nombres y precios acá.
// ---------------------------------------------------------------
const MENU = [
  { id: "culpable", name: "La culpable", price: 35 },
  { id: "crisis", name: "Crisis existencial", price: 40 },
  { id: "nadota", name: "Todo o mejor nadota", price: 50 },
  { id: "chocoflan", name: "Choco Flan", price: 10 },
  { id: "baba", name: "Babá al ron", price: 10 },
  { id: "porcion", name: "Porción", price: 10 },
];

const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "transferencia", label: "Transferencia" },
];

const COLORS = {
  wine: "#6B2039",
  wineDark: "#4E1729",
  gold: "#C89B3C",
  cream: "#F6EFE0",
  paper: "#FBF7EE",
  ink: "#2B2320",
  line: "#E1D3B6",
  muted: "#8A7A5C",
  danger: "#A23B2E",
};

function formatQ(n) {
  return `Q${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}

function formatOrderNumber(n) {
  return String(n).padStart(4, "0");
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("es-GT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CasiPizzaPOS() {
  const [screen, setScreen] = useState("menu"); // menu | summary | history
  const [cart, setCart] = useState({});
  const [payment, setPayment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [history, setHistory] = useState(null); // null = not loaded yet
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const items = MENU.map((m) => ({ ...m, qty: cart[m.id] || 0 }));
  const activeItems = items.filter((i) => i.qty > 0);
  const total = activeItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  function setQty(id, qty) {
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, qty) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  function limpiar() {
    setCart({});
  }

  function irAOrdenar() {
    if (activeItems.length === 0) return;
    setPayment(null);
    setSaveError(null);
    setScreen("summary");
  }

  async function guardarOrden() {
    if (saving || !payment || activeItems.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: activeItems.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
          total,
          paymentMethod: payment,
        }),
      });

      if (!res.ok) throw new Error("save failed");
      const data = await res.json();

      setConfirmation(data.order);
      setCart({});
      setPayment(null);
      setHistory(null); // Fuerza recarga del historial al volver
      setScreen("menu");
    } catch (err) {
      setSaveError(
        "No se pudo guardar la orden. Revisá tu conexión e intentá de nuevo."
      );
    } finally {
      setSaving(false);
    }
  }

  const cargarHistorial = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setHistory(data.orders || []);
    } catch (err) {
      setHistoryError("No se pudo cargar el historial. Intentá de nuevo.");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === "history" && history === null && !historyLoading) {
      cargarHistorial();
    }
  }, [screen, history, historyLoading, cargarHistorial]);

  const todayStr = new Date().toDateString();
  const todayOrders = (history || []).filter(
    (o) => new Date(o.timestamp).toDateString() === todayStr
  );
  const todayTotal = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayByMethod = PAYMENT_METHODS.map((m) => ({
    ...m,
    total: todayOrders
      .filter((o) => o.paymentMethod === m.id)
      .reduce((s, o) => s + o.total, 0),
  }));

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>CasiPizza</div>
          <div style={styles.brandSub}>
            {screen === "menu" && "Nueva orden"}
            {screen === "summary" && "Resumen de orden"}
            {screen === "history" && "Historial"}
          </div>
        </div>
        {screen !== "history" ? (
          <button style={styles.linkButton} onClick={() => setScreen("history")}>
            Historial
          </button>
        ) : (
          <button style={styles.linkButton} onClick={() => setScreen("menu")}>
            Nueva orden
          </button>
        )}
      </header>

      {screen === "menu" && (
        <MenuScreen
          items={items}
          total={total}
          setQty={setQty}
          limpiar={limpiar}
          irAOrdenar={irAOrdenar}
        />
      )}

      {screen === "summary" && (
        <SummaryScreen
          activeItems={activeItems}
          total={total}
          payment={payment}
          setPayment={setPayment}
          onVolver={() => setScreen("menu")}
          onGuardar={guardarOrden}
          saving={saving}
          saveError={saveError}
        />
      )}

      {screen === "history" && (
        <HistoryScreen
          loading={historyLoading}
          error={historyError}
          orders={history || []}
          todayOrders={todayOrders}
          todayTotal={todayTotal}
          todayByMethod={todayByMethod}
          onReintentar={cargarHistorial}
        />
      )}

      {confirmation && (
        <ConfirmationToast
          order={confirmation}
          onClose={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}

function Stepper({ value, onChange }) {
  return (
    <div style={styles.stepper}>
      <button
        style={{ ...styles.stepBtn, opacity: value === 0 ? 0.4 : 1 }}
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        aria-label="Restar"
      >
        −
      </button>
      <span style={styles.stepValue}>{value}</span>
      <button style={styles.stepBtn} onClick={() => onChange(value + 1)} aria-label="Sumar">
        +
      </button>
    </div>
  );
}

function MenuScreen({ items, total, setQty, limpiar, irAOrdenar }) {
  return (
    <div style={styles.screen}>
      <div style={styles.list}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              ...styles.row,
              borderBottom: idx === items.length - 1 ? "none" : `1px solid ${COLORS.line}`,
            }}
          >
            <div>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemPrice}>{formatQ(item.price)}</div>
            </div>
            <Stepper value={item.qty} onChange={(v) => setQty(item.id, v)} />
          </div>
        ))}
      </div>

      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Total</span>
        <span style={styles.totalValue}>{formatQ(total)}</span>
      </div>

      <div style={styles.actionsRow}>
        <button style={styles.secondaryBtn} onClick={limpiar}>
          Cancelar
        </button>
        <button 
          style={{ ...styles.primaryBtn, opacity: total === 0 ? 0.5 : 1 }} 
          onClick={irAOrdenar} 
          disabled={total === 0}
        >
          Ordenar
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({
  activeItems,
  total,
  payment,
  setPayment,
  onVolver,
  onGuardar,
  saving,
  saveError,
}) {
  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        {activeItems.map((item, idx) => (
          <div
            key={item.id}
            style={{
              ...styles.summaryRow,
              borderBottom:
                idx === activeItems.length - 1 ? "none" : `1px solid ${COLORS.line}`,
            }}
          >
            <span style={styles.summaryItemName}>
              {item.name} <span style={styles.summaryQty}>×{item.qty}</span>
            </span>
            <span style={styles.summarySubtotal}>{formatQ(item.qty * item.price)}</span>
          </div>
        ))}
      </div>

      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Total</span>
        <span style={styles.totalValue}>{formatQ(total)}</span>
      </div>

      <div style={styles.paymentSection}>
        <div style={styles.paymentLabel}>Método de pago</div>
        <div style={styles.paymentOptions}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayment(m.id)}
              style={{
                ...styles.paymentBtn,
                ...(payment === m.id ? styles.paymentBtnActive : {}),
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {saveError && <div style={styles.errorText}>{saveError}</div>}

      <div style={styles.actionsRow}>
        <button style={styles.secondaryBtn} onClick={onVolver} disabled={saving}>
          Volver
        </button>
        <button
          style={{
            ...styles.primaryBtn,
            opacity: !payment || saving ? 0.5 : 1,
          }}
          onClick={onGuardar}
          disabled={!payment || saving}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function HistoryScreen({
  loading,
  error,
  orders,
  todayOrders,
  todayTotal,
  todayByMethod,
  onReintentar,
}) {
  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.emptyState}>Cargando historial…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.screen}>
        <div style={styles.emptyState}>{error}</div>
        <button style={styles.primaryBtn} onClick={onReintentar}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.screen}>
      <div style={styles.todaySummary}>
        <div style={styles.todaySummaryTitle}>
          Hoy · {todayOrders.length} {todayOrders.length === 1 ? "orden" : "órdenes"}
        </div>
        <div style={styles.todaySummaryTotal}>{formatQ(todayTotal)}</div>
        <div style={styles.todayByMethod}>
          {todayByMethod.map((m) => (
            <span key={m.id}>
              {m.label}: {formatQ(m.total)}
            </span>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          Todavía no hay órdenes guardadas. En cuanto guardés la primera, aparece acá.
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order, idx) => (
            <div
              key={order.orderNumber || idx}
              style={{
                ...styles.historyRow,
                borderBottom: idx === orders.length - 1 ? "none" : `1px solid ${COLORS.line}`,
              }}
            >
              <div style={styles.historyTopLine}>
                <span style={styles.historyOrderNum}>
                  Orden #{formatOrderNumber(order.orderNumber)}
                </span>
                <span style={styles.historyTotal}>{formatQ(order.total)}</span>
              </div>
              <div style={styles.historyMeta}>
                {formatTime(order.timestamp)} ·{" "}
                {order.paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}
              </div>
              <div style={styles.historyItems}>
                {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmationToast({ order, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={styles.toast} onClick={onClose}>
      Orden #{formatOrderNumber(order.orderNumber)} guardada · {formatQ(order.total)}
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
    background: COLORS.cream,
    minHeight: "100vh",
    color: COLORS.ink,
    maxWidth: 480,
    margin: "0 auto",
    paddingBottom: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: "20px 20px 14px",
    background: COLORS.wine,
    color: COLORS.paper,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  brand: {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: 0.2,
  },
  brandSub: {
    fontSize: 13,
    color: COLORS.gold,
    marginTop: 2,
  },
  linkButton: {
    background: "transparent",
    border: `1px solid ${COLORS.gold}`,
    color: COLORS.gold,
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  screen: {
    padding: "18px 16px 8px",
  },
  list: {
    background: COLORS.paper,
    borderRadius: 14,
    overflow: "hidden",
    border: `1px solid ${COLORS.line}`,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 16px",
  },
  itemName: {
    fontSize: 16,
    fontWeight: 600,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: `1px solid ${COLORS.wine}`,
    background: COLORS.paper,
    color: COLORS.wine,
    fontSize: 18,
    lineHeight: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  stepValue: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 600,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    padding: "18px 4px 6px",
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.muted,
  },
  totalValue: {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 28,
    fontWeight: 600,
    color: COLORS.wine,
  },
  actionsRow: {
    display: "flex",
    gap: 12,
    marginTop: 14,
  },
  primaryBtn: {
    flex: 1,
    background: COLORS.wine,
    color: COLORS.paper,
    border: "none",
    borderRadius: 12,
    padding: "15px 0",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    flex: 1,
    background: "transparent",
    color: COLORS.wine,
    border: `1px solid ${COLORS.wine}`,
    borderRadius: 12,
    padding: "15px 0",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  card: {
    background: COLORS.paper,
    borderRadius: 14,
    border: `1px solid ${COLORS.line}`,
    overflow: "hidden",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 16px",
  },
  summaryItemName: {
    fontSize: 15,
  },
  summaryQty: {
    color: COLORS.muted,
  },
  summarySubtotal: {
    fontSize: 15,
    fontWeight: 600,
  },
  paymentSection: {
    marginTop: 16,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 8,
  },
  paymentOptions: {
    display: "flex",
    gap: 10,
  },
  paymentBtn: {
    flex: 1,
    padding: "13px 0",
    borderRadius: 12,
    border: `1px solid ${COLORS.line}`,
    background: COLORS.paper,
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },
  paymentBtnActive: {
    background: COLORS.wine,
    borderColor: COLORS.wine,
    color: COLORS.paper,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    marginTop: 12,
  },
  todaySummary: {
    background: COLORS.wineDark,
    color: COLORS.paper,
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 16,
  },
  todaySummaryTitle: {
    fontSize: 14,
    color: COLORS.gold,
  },
  todaySummaryTotal: {
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontSize: 26,
    fontWeight: 600,
    marginTop: 4,
  },
  todayByMethod: {
    display: "flex",
    gap: 14,
    fontSize: 13,
    marginTop: 8,
    color: COLORS.cream,
  },
  historyRow: {
    padding: "14px 16px",
  },
  historyTopLine: {
    display: "flex",
    justifyContent: "space-between",
  },
  historyOrderNum: {
    fontSize: 15,
    fontWeight: 600,
  },
  historyTotal: {
    fontSize: 15,
    fontWeight: 600,
    color: COLORS.wine,
  },
  historyMeta: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  historyItems: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyState: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 14,
    padding: "32px 12px",
  },
  toast: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: COLORS.ink,
    color: COLORS.paper,
    padding: "12px 20px",
    borderRadius: 999,
    fontSize: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    cursor: "pointer",
    zIndex: 100,
  },
};