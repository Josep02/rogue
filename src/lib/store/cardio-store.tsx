"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// --- Helpers ---

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Types ---

export type Coordinate = { lat: number; lng: number; timestamp: number };

export type CardioContextValue = {
  isTracking: boolean;
  isPaused: boolean;
  isMinimized: boolean;
  coordinates: Coordinate[];
  distanceKm: number;
  durationSec: number;
  startTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  stopTracking: () => void;
  minimize: () => void;
  maximize: () => void;
};

// --- Context ---

const CardioContext = createContext<CardioContextValue | null>(null);

// --- Provider ---

export function CardioProvider({ children }: { children: React.ReactNode }) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cronómetro
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => setDurationSec((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused]);

  const watchGPS = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoord: Coordinate = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
        };
        setCoordinates((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            setDistanceKm((d) => d + haversineKm(last.lat, last.lng, newCoord.lat, newCoord.lng));
          }
          return [...prev, newCoord];
        });
      },
      (err) => console.warn(`GPS (${err.code}): ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );
  }, []);

  const clearGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setIsPaused(false);
    setIsMinimized(false);
    setCoordinates([]);
    setDistanceKm(0);
    setDurationSec(0);
    watchGPS();
  }, [watchGPS]);

  const pauseTracking = useCallback(() => {
    setIsPaused(true);
    clearGPS();
  }, [clearGPS]);

  const resumeTracking = useCallback(() => {
    setIsPaused(false);
    watchGPS();
  }, [watchGPS]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setIsPaused(false);
    setIsMinimized(false);
    clearGPS();
    if (timerRef.current) clearInterval(timerRef.current);
  }, [clearGPS]);

  const minimize = useCallback(() => setIsMinimized(true), []);
  const maximize = useCallback(() => setIsMinimized(false), []);

  return (
    <CardioContext.Provider
      value={{
        isTracking,
        isPaused,
        isMinimized,
        coordinates,
        distanceKm,
        durationSec,
        startTracking,
        pauseTracking,
        resumeTracking,
        stopTracking,
        minimize,
        maximize,
      }}
    >
      {children}
    </CardioContext.Provider>
  );
}

// --- Hook ---

export function useCardio(): CardioContextValue {
  const ctx = useContext(CardioContext);
  if (!ctx) throw new Error("useCardio debe usarse dentro de CardioProvider");
  return ctx;
}
