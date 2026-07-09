import type { ExerciseCategory } from "@/lib/exercises/types";

export type Sex = "hombre" | "mujer";

export type Profile = {
  onboarded: boolean;
  name: string;
  sex: Sex;
  bodyweightKg: number;
  heightCm: number;
  goal: string;
};

export type WeightUnit = "kg" | "lb";

/** Ajustes del usuario (persisten junto al resto del estado). */
export type Preferences = {
  unit: WeightUnit;
  /** Recordatorio diario de la sesion que toca. */
  notifyReminders: boolean;
  /** Aviso (vibracion/notificacion) al terminar el descanso entre series. */
  notifyRestEnd: boolean;
  /** Resumen semanal de progreso. */
  notifyWeeklySummary: boolean;
};

/** Un ejercicio dentro de un dia de rutina. */
export type RoutineExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  restSec: number;
  /** Peso sugerido de partida (kg); 0 = peso corporal. */
  suggestedKg: number;
};

export type RoutineDay = {
  id: string;
  label: string;
  focus: string;
  exercises: RoutineExercise[];
};

export type Routine = {
  name: string;
  days: RoutineDay[];
};

/** Una serie efectivamente registrada en una sesion. */
export type LoggedSet = {
  exerciseId: string;
  /** Categoria del ejercicio (para mostrar tags de historial), no la region de rango. */
  grupo: ExerciseCategory;
  weightKg: number;
  reps: number;
};

export type WorkoutSession = {
  id: string;
  dateISO: string;
  dayLabel: string;
  sets: LoggedSet[];
};
