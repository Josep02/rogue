"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";

/**
 * Solicita pantalla completa al primer toque del usuario (gesto requerido
 * por el navegador). Oculta la barra de home en Android/Chrome.
 *
 * - Solo se muestra en dispositivos donde `requestFullscreen` está disponible.
 * - Si el usuario ya está en fullscreen (p.ej. PWA) no hace nada.
 * - Se recuerda la preferencia en localStorage para no volver a preguntar.
 */
export function FullscreenPrompt() {
  const [visible, setVisible] = useState(false);
  const dismissed = useRef(false);

  useEffect(() => {
    // No preguntar si: ya está en FS, la API no existe, o el usuario ya lo descartó
    if (
      document.fullscreenElement ||
      !document.documentElement.requestFullscreen ||
      localStorage.getItem("rogue:fullscreen-dismissed") === "1"
    ) {
      return;
    }

    // Solo en móvil (excluir md+)
    if (window.innerWidth >= 768) return;

    setVisible(true);
  }, []);

  // Salir de fullscreen cuando cambia de pestaña / cierra
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        dismissed.current = false;
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      // El navegador rechazó o no está soportado; silenciar
    }
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem("rogue:fullscreen-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-28 z-50 flex justify-center px-4"
      aria-live="polite"
    >
      <div
        className={[
          "pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3",
          "bg-white/85 shadow-[0_8px_32px_-4px_rgba(23,24,28,0.22)] backdrop-blur-2xl",
          "dark:bg-zinc-900/85 dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.6)]",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
        ].join(" ")}
      >
        <Maximize2 className="size-4 shrink-0 text-accent" strokeWidth={2} />
        <p className="text-xs font-medium text-foreground">
          Activa pantalla completa para una mejor experiencia
        </p>
        <button
          onClick={enterFullscreen}
          className="shrink-0 rounded-xl bg-accent px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-75"
        >
          Activar
        </button>
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="shrink-0 text-muted-foreground transition-opacity hover:opacity-70"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
