"use client";

import React, { useState, useEffect } from "react";
import HeaderNav from "./components/HeaderNav";
import ProductCard from "./components/ProductCard";
import CartHeader from "./components/CartHeader";
import ActionButton from "./components/ActionButton";

const LOCAL_IMAGE = "/imagenes/pizza.webp";

const PIZZAS_CLASICAS = [
  { id: "crisis", name: "Crisis", price: 35, image: LOCAL_IMAGE },
  { id: "todote", name: "Todo o mejor nadota", price: 50, image: LOCAL_IMAGE },
  { id: "culpable", name: "La culpable", price: 35, image: LOCAL_IMAGE },
];

const PIZZAS_PREMIUM = [
  { id: "margherita", name: "Margherita", price: "Q.tba", image: LOCAL_IMAGE, isPremium: true },
  { id: "aura", name: "+aura Prosciutto e Rucola", price: "Q.tba", image: LOCAL_IMAGE, isPremium: true },
  { id: "diavola", name: "Diavola", price: "Q.tba", image: LOCAL_IMAGE, isPremium: true },
  { id: "marinara", name: "Marinara", price: "Q.tba", image: LOCAL_IMAGE, isPremium: true },
];

const EXTRAS = [
  { id: "burrata", name: "Agrega Burrata Extra", price: 50, image: LOCAL_IMAGE },
];

const POSTRES = [
  { id: "chocoflan", name: "Choco Flan", price: 10, image: LOCAL_IMAGE },
  { id: "baba", name: "Babá al ron", price: 10, image: LOCAL_IMAGE },
];

export default function CasiPizzaPOS() {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [comments, setComments] = useState("");
  const [view, setView] = useState("pos");
  const [orders, setOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const totalAmount = cart.reduce(
    (acc, item) => acc + (typeof item.price === "number" ? item.price * item.qty : 0),
    0
  );

  const handleItemTap = (product) => {
    if (typeof product.price !== "number") {
      alert(`El precio de ${product.name} aún está por definirse (Q.tba).`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveOne = (productId) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === productId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveAll = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCancel = () => {
    setCart([]);
    setComments("");
    setView("pos");
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteOrder = async (orderNumber) => {
    if (!confirm(`¿Estás seguro de eliminar la orden #${orderNumber}?`)) return;

    try {
      const res = await fetch(`/api/orders?orderNumber=${orderNumber}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
      } else {
        alert("Error al eliminar la orden");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  useEffect(() => {
    if (view === "history") fetchHistory();
  }, [view]);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setSavingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: totalAmount, paymentMethod, comments }),
      });

      if (res.ok) {
        setCart([]);
        setComments("");
        setView("pos");
        alert("¡Orden realizada con éxito!");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setSavingOrder(false);
    }
  };

  // Formateador de fecha/hora
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleString("es-GT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="pos-container">
      <HeaderNav activeView={view} onViewChange={setView} />

      {/* VISTA 1: POS */}
      {view === "pos" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={categoryTitleStyle}>PIZZAS</h2>
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={subCategoryTitleStyle}>CLÁSICAS</span>
              <div className="products-grid">
                {PIZZAS_CLASICAS.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={() => handleItemTap(product)} />
                ))}
              </div>
            </div>

            <div>
              <span style={{ ...subCategoryTitleStyle, color: "#CA3918" }}>★ PREMIUM</span>
              <div className="products-grid">
                {PIZZAS_PREMIUM.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={() => handleItemTap(product)} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <h2 style={categoryTitleStyle}>EXTRAS & BURRATA</h2>
            <div className="products-grid">
              {EXTRAS.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => handleItemTap(product)} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <h2 style={categoryTitleStyle}>POSTRES</h2>
            <div className="products-grid">
              {POSTRES.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => handleItemTap(product)} />
              ))}
            </div>
          </div>

          <CartHeader
            totalAmount={totalAmount}
            cart={cart}
            onRemoveOne={handleRemoveOne}
            onRemoveAll={handleRemoveAll}
          />

          <div className="actions-grid">
            <ActionButton label="COBRAR" variant="primary" disabled={cart.length === 0} onClick={() => setView("checkout")} />
            <ActionButton label="CANCELAR" variant="neutral" onClick={handleCancel} />
          </div>
        </div>
      )}

      {/* VISTA 2: CHECKOUT (Reorganizada: Resumen -> Comentarios -> Métodos & Botones) */}
      {view === "checkout" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem 0" }}>
          
          {/* 1. ARRIBA: RESUMEN DE ORDEN */}
          <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: "2rem", color: "#CA3918", margin: "0 0 1rem 0" }}>RESUMEN DE ORDEN</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", fontSize: "1.35rem", color: "#F8FAE3" }}>
                  <span>{item.qty} {item.name.toLowerCase()}</span>
                  <div style={{ flex: 1, borderBottom: "2px dashed #CA3918", marginBottom: "0.25rem" }} />
                  <span style={{ color: "#4EA3CB" }}>Q.{item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", fontSize: "1.85rem", paddingTop: "0.75rem", color: "#F8FAE3" }}>
                <span>TOTAL</span>
                <div style={{ flex: 1, borderBottom: "2px dashed #CA3918", marginBottom: "0.25rem" }} />
                <span style={{ color: "#CA3918" }}>Q.{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* 2. EN MEDIO: CAMPO DE COMENTARIOS / NOTAS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "1.1rem", color: "#4EA3CB" }}>COMENTARIOS / NOTAS (Opcional):</label>
            <input
              type="text"
              placeholder="Ej. TEST, sin cebolla, mesa 2..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "0.5rem",
                border: "2px solid #4EA3CB",
                backgroundColor: "#F8FAE3",
                color: "#00232F",
                fontSize: "1.1rem",
                fontFamily: "sans-serif",
                outline: "none",
              }}
            />
          </div>

          {/* 3. ABAJO: MÉTODO DE PAGO Y BOTONES DE ACCIÓN */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="actions-grid">
              <ActionButton label="EFECTIVO" variant={paymentMethod === "efectivo" ? "primary" : "neutral"} onClick={() => setPaymentMethod("efectivo")} />
              <ActionButton label="TRANSFERENCIA" variant={paymentMethod === "transferencia" ? "primary" : "neutral"} onClick={() => setPaymentMethod("transferencia")} />
            </div>

            <div className="actions-grid">
              <ActionButton label={savingOrder ? "GUARDANDO..." : "CONFIRMAR"} variant="primary" disabled={savingOrder} onClick={handleConfirmOrder} />
              <ActionButton label="CANCELAR" variant="neutral" onClick={() => setView("pos")} />
            </div>
          </div>

        </div>
      )}

      {/* VISTA 3: HISTORIAL (Con Fecha y Opción de Eliminar) */}
      {view === "history" && (
        <div style={{ flex: 1, padding: "1rem 0" }}>
          <h2 style={{ fontSize: "2rem", color: "#CA3918", marginBottom: "1.25rem" }}>HISTORIAL DE VENTAS</h2>
          {loadingHistory ? (
            <p style={{ color: "#4EA3CB", fontSize: "1.2rem" }}>CARGANDO...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map((o) => (
                <div key={o.orderNumber} style={{ border: "2px solid #4EA3CB", backgroundColor: "#F8FAE3", padding: "1rem", borderRadius: "0.75rem", color: "#00232F" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.25rem", fontWeight: "bold" }}>
                    <span>ORDEN #{o.orderNumber} ({o.paymentMethod.toUpperCase()})</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "#CA3918" }}>Q.{o.total}</span>
                      <button
                        onClick={() => handleDeleteOrder(o.orderNumber)}
                        style={{
                          backgroundColor: "#CA3918",
                          color: "#F8FAE3",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "0.3rem",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                        }}
                      >
                        BORRAR
                      </button>
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.2rem" }}>
                    {formatDate(o.timestamp)}
                  </div>

                  {/* Comentario si existe */}
                  {o.comments && (
                    <div style={{ marginTop: "0.4rem", padding: "0.3rem 0.5rem", backgroundColor: "#EAEAEA", borderRadius: "0.3rem", fontSize: "0.95rem", color: "#00232F", fontStyle: "italic" }}>
                      <strong>Nota:</strong> {o.comments}
                    </div>
                  )}

                  {/* Detalle de Items */}
                  <div style={{ color: "#00232F", opacity: 0.8, fontSize: "1rem", marginTop: "0.5rem" }}>
                    {o.items?.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

const categoryTitleStyle = {
  fontSize: "1.5rem",
  color: "#4EA3CB",
  margin: "0.5rem 0",
  borderBottom: "2px solid #4EA3CB",
  paddingBottom: "0.25rem",
  letterSpacing: "0.05em",
};

const subCategoryTitleStyle = {
  fontSize: "1.1rem",
  color: "#F8FAE3",
  letterSpacing: "0.08em",
  opacity: 0.9,
  display: "inline-block",
  marginTop: "0.5rem",
};