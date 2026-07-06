import type { MuscleGroup } from "@/lib/ranks";

export type Sex = "hombre" | "mujer";

export type Profile = {
  onboarded: boolean;
  name: string;
  sex: Sex;
  bodyweightKg: number;
  heightCm: number;
  goal: string;
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
  grupo: MuscleGroup;
  weightKg: number;
  reps: number;
};

export type WorkoutSession = {
  id: string;
  dateISO: string;
  dayLabel: string;
  sets: LoggedSet[];
};
