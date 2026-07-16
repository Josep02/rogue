/**
 * Cola de escrituras a Supabase.
 *
 * Todas las escrituras "best effort" de los stores pasan por aqui:
 * - Se ejecutan en orden (FIFO): el reintento de una escritura antigua nunca
 *   puede pisar una posterior (p.ej. dos patches seguidos al perfil).
 * - Ante un fallo (sin conexion, RLS, constraint...) se reintenta con espera;
 *   si sigue fallando queda registrada y la UI avisa (SyncErrorToast) con
 *   opcion de reintentar, en vez de fingir que se guardo.
 *
 * Las funciones `run` deben LANZAR en caso de error (supabase-js no rechaza:
 * resuelve con { error }) y ser idempotentes (upsert / delete+insert), porque
 * un reintento puede repetir una escritura que fallo a medias.
 */

export type FailedWrite = {
  id: string;
  /** Que se estaba guardando, para el mensaje ("el entreno", "la comida"...). */
  label: string;
  run: () => Promise<void>;
};

const RETRY_DELAYS_MS = [1500, 5000];

let queue: Promise<void> = Promise.resolve();
// Inmutable: cada cambio reasigna el array para que useSyncExternalStore
// detecte el nuevo snapshot por identidad.
let failed: FailedWrite[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** Para useSyncExternalStore (ver SyncErrorToast). */
export function subscribeSyncFailures(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFailedWrites(): FailedWrite[] {
  return failed;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function attempt(label: string, run: () => Promise<void>) {
  for (let i = 0; ; i++) {
    try {
      await run();
      return;
    } catch (err) {
      if (i >= RETRY_DELAYS_MS.length) {
        console.error(`No se pudo guardar ${label}:`, err);
        failed = [
          ...failed,
          {
            id: `w-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            label,
            run,
          },
        ];
        notify();
        return;
      }
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }
}

/** Encola una escritura. Nunca lanza: el fallo definitivo se reporta via
 *  subscribeSyncFailures. */
export function syncWrite(label: string, run: () => Promise<void>) {
  queue = queue.then(() => attempt(label, run));
}

/** Re-encola todas las escrituras fallidas (boton "Reintentar" del aviso). */
export function retryFailedWrites() {
  const pending = failed;
  failed = [];
  notify();
  for (const write of pending) syncWrite(write.label, write.run);
}

/** Descarta los fallos pendientes (el usuario cierra el aviso). */
export function dismissFailedWrites() {
  failed = [];
  notify();
}
