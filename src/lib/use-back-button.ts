"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Intercepta el botón/gesto "atrás" mientras `active` es true, ejecutando
 * `onBack()` en vez de salir de la app o cambiar de página.
 * 
 * En APK (Capacitor), usa la API nativa de App para interceptar el gesto sin
 * corromper el historial del WebView (lo que previene el glitch de la animación
 * predictiva de Chrome 116+ en Android 14+).
 * 
 * En Web/PWA, usa un "trampa" en el History API inyectando un estado dummy.
 */
export function useBackButton(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    if (Capacitor.isNativePlatform()) {
      // Capacitor: Intercepción nativa
      const listener = App.addListener("backButton", () => {
        onBackRef.current();
      });

      return () => {
        listener.then((l) => l.remove());
      };
    } else {
      // PWA/Web: Trampa de historial
      let armed = true;
      window.history.pushState({ __rogueTrap: true }, "");

      const handler = () => {
        onBackRef.current();
        // Re-arma para seguir capturando el "atrás" mientras siga activo.
        if (armed) window.history.pushState({ __rogueTrap: true }, "");
      };

      window.addEventListener("popstate", handler);

      return () => {
        armed = false;
        window.removeEventListener("popstate", handler);
        // Si se cerró por otra vía y nuestra entrada sigue arriba, la retiramos.
        if (window.history.state?.__rogueTrap) window.history.back();
      };
    }
  }, [active]);
}
