import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea una duracion en segundos como "m:ss" o "h:mm:ss" (para el
 *  cronometro de sesion, que cuenta tiempo real incluyendo descansos). */
export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** Formatea una duracion en segundos de forma legible: "45 min", "1 h 5 min",
 *  "2 h". Para resumenes y estadisticas (no para un cronometro en vivo). */
export function formatDurationLabel(totalSec: number): string {
  const totalMin = Math.round(Math.max(0, totalSec) / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
