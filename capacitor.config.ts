import type { CapacitorConfig } from "@capacitor/cli";

// Configuracion de Capacitor. Como la app NO es estatica (Server Actions, rutas
// API, middleware/proxy), el contenedor nativo carga la app servida via
// server.url en vez de empaquetar assets estaticos.
//
// - En DESARROLLO: apunta al dev server por la IP de la red local (el movil debe
//   estar en la misma wifi). cleartext=true permite http.
// - En PRODUCCION: cambia server.url a tu dominio https y quita cleartext (o
//   elimina el bloque server para empaquetar un build real).
const config: CapacitorConfig = {
  appId: "com.rogue.app",
  appName: "Rogue",
  webDir: "capacitor-www",
  server: {
    url: "https://rogue-two.vercel.app",
    cleartext: false,
  },
};

export default config;
