"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CloudOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  dismissFailedWrites,
  getFailedWrites,
  retryFailedWrites,
  subscribeSyncFailures,
} from "@/lib/supabase/sync";

const subscribeNever = () => () => {};

/** Aviso persistente cuando alguna escritura a Supabase ha fallado tras los
 *  reintentos automaticos: lo que se ve en pantalla NO esta guardado. Se
 *  renderiza dentro de #app-shell (mismo patron que los modales) para casar
 *  con el ancho del frame de la app. */
export function SyncErrorToast() {
  const failed = useSyncExternalStore(
    subscribeSyncFailures,
    getFailedWrites,
    getFailedWrites,
  );
  // false durante SSR/hidratacion, true tras montar: no hay #app-shell hasta
  // que existe el DOM.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  if (failed.length === 0 || !mounted) return null;
  const portalTarget = document.getElementById("app-shell");
  if (!portalTarget) return null;

  const labels = [...new Set(failed.map((f) => f.label))].join(", ");

  return createPortal(
    <div className="absolute inset-x-0 bottom-24 z-[70] px-5 md:bottom-6">
      <div
        role="alert"
        className="mx-auto flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-2xl md:max-w-sm"
      >
        <CloudOff className="size-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Cambios sin guardar</p>
          <p className="truncate text-xs text-muted-foreground">
            No se pudo guardar: {labels}.
          </p>
        </div>
        <Button
          onClick={retryFailedWrites}
          className="shrink-0 px-4 py-2 text-xs"
        >
          Reintentar
        </Button>
        <button
          type="button"
          onClick={dismissFailedWrites}
          aria-label="Descartar aviso"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>,
    portalTarget,
  );
}
