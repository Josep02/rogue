import type { MuscleGroup } from "@/lib/ranks";

/** Musculo concreto (granular), usado por el mapa muscular SVG. */
export type MuscleId =
  | "pectoral"
  | "dorsal"
  | "espalda-media"
  | "lumbar"
  | "trapecio"
  | "deltoide"
  | "biceps"
  | "triceps"
  | "antebrazo"
  | "cuadriceps"
  | "isquiotibiales"
  | "gemelos"
  | "gluteo"
  | "aductores"
  | "abductores"
  | "abdominales"
  | "oblicuos";

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  pectoral: "Pectoral",
  dorsal: "Dorsal",
  "espalda-media": "Espalda media",
  lumbar: "Lumbar",
  trapecio: "Trapecio",
  deltoide: "Deltoides",
  biceps: "Biceps",
  triceps: "Triceps",
  antebrazo: "Antebrazo",
  cuadriceps: "Cuadriceps",
  isquiotibiales: "Isquiotibiales",
  gemelos: "Gemelos",
  gluteo: "Gluteo",
  aductores: "Aductores",
  abductores: "Abductores",
  abdominales: "Abdominales",
  oblicuos: "Oblicuos",
};

/** A que region de rango pertenece cada musculo granular. */
export const MUSCLE_TO_GROUP: Record<MuscleId, MuscleGroup> = {
  pectoral: "Pecho",
  dorsal: "Espalda",
  "espalda-media": "Espalda",
  lumbar: "Espalda",
  trapecio: "Espalda",
  deltoide: "Hombros",
  biceps: "Brazo",
  antebrazo: "Brazo",
  triceps: "Brazo",
  cuadriceps: "Pierna",
  isquiotibiales: "Pierna",
  gemelos: "Pierna",
  aductores: "Pierna",
  abductores: "Pierna",
  gluteo: "Pierna",
  abdominales: "Core",
  oblicuos: "Core",
};

/**
 * Categoria propia del ejercicio (biblioteca/filtros): mas granular que la
 * region de rango (MuscleGroup) para no perder capacidad de busqueda -
 * "solo ejercicios de biceps" sigue siendo un filtro valido aunque el rango
 * de Biceps y Triceps ahora se fusionen en el rango de "Brazo".
 */
export const EXERCISE_CATEGORIES = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Biceps",
  "Triceps",
  "Piernas",
  "Gluteos",
  "Core",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export type EquipmentId =
  | "barra"
  | "mancuernas"
  | "maquina"
  | "polea"
  | "peso-corporal"
  | "kettlebell"
  | "barra-z"
  | "otro";

export const EQUIPMENT_LABELS: Record<EquipmentId, string> = {
  barra: "Barra",
  mancuernas: "Mancuernas",
  maquina: "Maquina",
  polea: "Polea",
  "peso-corporal": "Peso corporal",
  kettlebell: "Kettlebell",
  "barra-z": "Barra Z",
  otro: "Otro",
};

export type DifficultyId = "principiante" | "intermedio" | "avanzado";

export const DIFFICULTY_LABELS: Record<DifficultyId, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export type Exercise = {
  /** Slug propio en espanol, usado en la URL /biblioteca/[id]. */
  id: string;
  nombre: string;
  /** Categoria muscular principal (para biblioteca/filtros, no para rangos). */
  grupo: ExerciseCategory;
  equipo: EquipmentId;
  dificultad: DifficultyId;
  mecanica: "compuesto" | "aislamiento";
  musculosPrimarios: MuscleId[];
  musculosSecundarios: MuscleId[];
  instrucciones: string[];
  consejos: string[];
  /**
   * Id del ejercicio en free-exercise-db (fuente de las imagenes).
   * Cada ejercicio tiene 2 frames: {fuenteId}/0.jpg y {fuenteId}/1.jpg.
   */
  fuenteId: string;
};

export type ExerciseFilters = {
  query?: string;
  grupo?: ExerciseCategory;
  equipo?: EquipmentId;
  dificultad?: DifficultyId;
};
