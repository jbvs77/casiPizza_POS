import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const raw = await kv.lrange("orders:list", 0, -1);

    if (!raw || raw.length === 0) {
      return Response.json({ orders: [] });
    }

    // Parsea y tolera cualquier formato anterior
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
    const { items, total, paymentMethod } = body;

    if (!Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return Response.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Genera el número de orden consecutivo
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