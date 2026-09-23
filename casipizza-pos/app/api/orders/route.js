import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const raw = await kv.lrange("orders:list", 0, -1);

    if (!raw || raw.length === 0) {
      return Response.json({ orders: [] });
    }

    const orders = raw
      .map((r) => {
        try {
          return typeof r === "string" ? JSON.parse(r) : r;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b.orderNumber || 0) - (a.orderNumber || 0));

    return Response.json({ orders });
  } catch (err) {
    console.error("Error en GET /api/orders:", err);
    return Response.json(
      { error: "No se pudo cargar el historial desde la base de datos." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, total, paymentMethod, comments } = body;

    if (!Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return Response.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const orderNumber = await kv.incr("order-counter");

    const order = {
      orderNumber,
      timestamp: new Date().toISOString(),
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price) || 0,
        qty: Number(i.qty) || 1,
      })),
      total: Number(total) || 0,
      paymentMethod,
      comments: comments || "", // Se guarda el comentario si existe
    };

    await kv.lpush("orders:list", JSON.stringify(order));

    return Response.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Error en POST /api/orders:", err);
    return Response.json(
      { error: "No se pudo guardar la orden en la base de datos." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = Number(searchParams.get("orderNumber"));

    if (!orderNumber) {
      return Response.json({ error: "OrderNumber inválido" }, { status: 400 });
    }

    const raw = await kv.lrange("orders:list", 0, -1);
    
    // Filtramos las órdenes descartando la que queremos eliminar
    for (const item of raw) {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      if (parsed && parsed.orderNumber === orderNumber) {
        // Removemos el registro exacto en Redis KV
        await kv.lrem("orders:list", 1, typeof item === "string" ? item : JSON.stringify(item));
        break;
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Error en DELETE /api/orders:", err);
    return Response.json({ error: "Error al eliminar orden" }, { status: 500 });
  }
}