import type { NextRequest } from "next/server";
import { fetchOffProduct } from "@/lib/food/openfoodfacts";
import {
  rateLimit,
  requireUser,
  tooManyRequests,
  unauthorized,
} from "@/lib/api/guard";

// Proxy a Open Food Facts: consulta un producto por codigo de barras desde el
// servidor (control del User-Agent, sin exponer nada al cliente).
//
// Requiere sesion: sin esto era un proxy abierto que cualquiera podia usar
// contra OFF a nuestra costa. Limite generoso: escanear varios productos
// seguidos es uso normal.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ barcode: string }> },
) {
  const userId = await requireUser();
  if (!userId) return unauthorized();
  if (!rateLimit(`food:${userId}`, 60, 60_000)) return tooManyRequests();

  const { barcode } = await params;
  const product = await fetchOffProduct(barcode);
  if (!product) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json({ product });
}
