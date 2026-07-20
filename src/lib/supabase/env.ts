/**
 * Comprobacion de configuracion de Supabase.
 *
 * Al clonar el repo sin `.env.local`, los clientes de Supabase se crean con
 * URL/clave `undefined` y lanzan una excepcion que rompe toda la app. Estos
 * helpers permiten detectar el caso y mostrar una pagina de setup en lugar del
 * error generico. Solo se comprueban las variables PUBLICAS (las que necesita
 * el navegador para renderizar); la clave secreta es opcional y solo hace
 * falta para el login por username.
 */

/** Variables publicas obligatorias para que la app arranque. */
export const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

/** Devuelve las variables publicas obligatorias que faltan (vacio si todo ok). */
export function getMissingSupabaseEnv(): string[] {
  return REQUIRED_PUBLIC_ENV.filter((key) => !process.env[key]);
}

/** True si Supabase tiene lo minimo para funcionar. */
export function isSupabaseConfigured(): boolean {
  return getMissingSupabaseEnv().length === 0;
}
