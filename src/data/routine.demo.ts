import type { Routine } from "@/lib/workout/types";

/**
 * Rutina de demo (Push / Pull / Pierna). Los pesos sugeridos son el punto de
 * partida al entrenar; el usuario los ajusta. Cuando exista el constructor de
 * rutinas, esto vendra de datos del usuario.
 */
export const DEMO_ROUTINE: Routine = {
  name: "Hipertrofia · 3 dias",
  days: [
    {
      id: "empuje",
      label: "Empuje",
      focus: "Pecho · Hombro · Triceps",
      weekdays: [1, 4],
      exercises: [
        { exerciseId: "press-banca", sets: 4, reps: 8, restSec: 120, suggestedKg: 80 },
        { exerciseId: "press-militar", sets: 3, reps: 8, restSec: 120, suggestedKg: 45 },
        { exerciseId: "aperturas-inclinadas", sets: 3, reps: 12, restSec: 75, suggestedKg: 16 },
        { exerciseId: "press-frances", sets: 3, reps: 10, restSec: 75, suggestedKg: 30 },
        { exerciseId: "elevaciones-laterales", sets: 3, reps: 15, restSec: 60, suggestedKg: 12 },
      ],
    },
    {
      id: "tiron",
      label: "Tiron",
      focus: "Espalda · Biceps",
      weekdays: [2, 5],
      exercises: [
        { exerciseId: "dominadas", sets: 4, reps: 8, restSec: 120, suggestedKg: 0 },
        { exerciseId: "remo-con-barra", sets: 4, reps: 8, restSec: 120, suggestedKg: 70 },
        { exerciseId: "jalon-al-pecho", sets: 3, reps: 10, restSec: 90, suggestedKg: 65 },
        { exerciseId: "curl-barra", sets: 3, reps: 10, restSec: 75, suggestedKg: 35 },
        { exerciseId: "face-pull", sets: 3, reps: 15, restSec: 60, suggestedKg: 25 },
      ],
    },
    {
      id: "pierna",
      label: "Pierna",
      focus: "Cuadriceps · Isquios · Gluteo",
      weekdays: [3, 6],
      exercises: [
        { exerciseId: "sentadilla", sets: 4, reps: 6, restSec: 150, suggestedKg: 110 },
        { exerciseId: "peso-muerto-rumano", sets: 3, reps: 8, restSec: 120, suggestedKg: 90 },
        { exerciseId: "prensa", sets: 3, reps: 12, restSec: 90, suggestedKg: 130 },
        { exerciseId: "hip-thrust", sets: 3, reps: 10, restSec: 90, suggestedKg: 120 },
        { exerciseId: "curl-femoral", sets: 3, reps: 12, restSec: 60, suggestedKg: 45 },
      ],
    },
  ],
};
