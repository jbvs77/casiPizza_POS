import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const raw = await kv.lrange("orders:list", 0, -1);
    const orders = raw
      .map((r) => (typeof r === "string" ? JSON.parse(r) : r))
      .sort((a, b) => b.orderNumber - a.orderNumber);
    return Response.json({ orders });
  } catch (err) {
    return Response.json(
      { error: "No se pudo cargar el historial" },
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

    const orderNumber = await kv.incr("order-counter");

    const order = {
      orderNumber,
      timestamp: new Date().toISOString(),
      items,
      total,
      paymentMethod,
    };

    await kv.lpush("orders:list", JSON.stringify(order));

    return Response.json({ order });
  } catch (err) {
    return Response.json(
      { error: "No se pudo guardar la orden" },
      { status: 500 }
    );
  }
}
