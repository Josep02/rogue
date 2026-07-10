import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la clave secreta (service_role): bypassa RLS por completo.
 * SOLO para usos server-side muy puntuales (resolver username -> email para
 * el login). Nunca importar desde un componente cliente ni exponer su
 * resultado tal cual al navegador. "server-only" hace que el build falle si
 * este modulo se cuela en un bundle de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
