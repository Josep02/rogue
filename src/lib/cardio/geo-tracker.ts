import { Capacitor, registerPlugin } from "@capacitor/core";

// Abstraccion de seguimiento GPS con dos implementaciones:
//  - NATIVO (Capacitor): @capacitor-community/background-geolocation, que sigue
//    grabando con la app en segundo plano o la pantalla apagada (mantiene un
//    servicio en primer plano con notificacion). Es lo que la web no puede dar.
//  - WEB/PWA: navigator.geolocation.watchPosition (solo en primer plano).
// El resto de la app (cardio-store) usa esta interfaz sin saber cual corre.
//
// IMPORTANTE: los tipos del plugin se definen AQUI, no se importan del paquete.
// Ese paquete no trae JS (solo tipos + codigo nativo), asi que cualquier import
// desde el rompe el bundle web de Turbopack. En nativo, registerPlugin enruta
// las llamadas al codigo nativo via el puente de Capacitor por su nombre.

type BgLocation = {
  latitude: number;
  longitude: number;
  time?: number | null;
};
type BgError = { message?: string };
interface BgGeoPlugin {
  addWatcher(
    options: {
      backgroundMessage?: string;
      backgroundTitle?: string;
      requestPermissions?: boolean;
      stale?: boolean;
      distanceFilter?: number;
    },
    callback: (position?: BgLocation, error?: BgError) => void,
  ): Promise<string>;
  removeWatcher(options: { id: string }): Promise<void>;
}

const BackgroundGeolocation =
  registerPlugin<BgGeoPlugin>("BackgroundGeolocation");

export type GeoPosition = { lat: number; lng: number; timestamp: number };
export type GeoError = { code?: number; message: string };
export type StopWatch = () => void;

/** Arranca el seguimiento. Devuelve una funcion para detenerlo. */
export async function startGeoWatch(
  onPosition: (p: GeoPosition) => void,
  onError: (e: GeoError) => void,
): Promise<StopWatch> {
  if (Capacitor.isNativePlatform()) {
    const id = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: "Grabando tu ruta de cardio.",
        backgroundTitle: "Rogue · cardio en marcha",
        requestPermissions: true,
        // No entregar posiciones "viejas" cacheadas al arrancar.
        stale: false,
        // Metros minimos entre lecturas: reduce ruido y bateria.
        distanceFilter: 5,
      },
      (location, error) => {
        if (error) {
          onError({ message: error.message ?? "No se pudo acceder al GPS." });
          return;
        }
        if (location) {
          onPosition({
            lat: location.latitude,
            lng: location.longitude,
            timestamp: location.time ?? Date.now(),
          });
        }
      },
    );
    return () => {
      BackgroundGeolocation.removeWatcher({ id }).catch(() => {});
    };
  }

  // --- Web / PWA ---
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    onError({ message: "Este dispositivo no soporta geolocalizacion." });
    return () => {};
  }
  const wid = navigator.geolocation.watchPosition(
    (pos) =>
      onPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: pos.timestamp,
      }),
    (err) => onError({ code: err.code, message: err.message }),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
  );
  return () => navigator.geolocation.clearWatch(wid);
}
