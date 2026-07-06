import { RANK_TIERS, type MuscleGroup, type RankId } from "./ranks";
import type { Sex, WorkoutSession } from "./workout/types";

/**
 * Motor de rangos: fuerza relativa (1RM estimado / peso corporal) comparada
 * con estandares por grupo muscular y sexo. Primera version de las tablas:
 * calibrar con datos reales mas adelante.
 */

/** Minimo de sesiones con carga en un grupo antes de asignarle rango. */
export const MIN_SESSIONS_TO_RANK = 2;

/** 1RM estimado con la formula de Epley. Se capa a 12 reps (pierde fiabilidad). */
export function estimate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  const r = Math.min(reps, 12);
  return weightKg * (1 + r / 30);
}

/**
 * Ratio 1RM/peso corporal para ENTRAR en cada tier (hombres), por grupo.
 * Indices 0..4 = Bronce, Plata, Oro, Esmeralda, Maestro; indice 5 = techo.
 */
const MEN_BOUNDARIES: Record<MuscleGroup, number[]> = {
  Pecho: [0.4, 0.7, 1.0, 1.3, 1.6, 1.9],
  Espalda: [0.4, 0.7, 1.0, 1.3, 1.6, 1.9],
  Hombros: [0.3, 0.45, 0.6, 0.75, 0.9, 1.05],
  Biceps: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
  Triceps: [0.25, 0.4, 0.55, 0.7, 0.85, 1.0],
  Piernas: [0.7, 1.1, 1.5, 1.9, 2.3, 2.7],
  Gluteos: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5],
  Core: [0.2, 0.35, 0.5, 0.65, 0.8, 0.95],
};

/** Factor aplicado a las mujeres sobre los umbrales masculinos. */
const SEX_FACTOR: Record<MuscleGroup, number> = {
  Pecho: 0.68,
  Espalda: 0.68,
  Hombros: 0.68,
  Biceps: 0.65,
  Triceps: 0.65,
  Piernas: 0.8,
  Gluteos: 0.85,
  Core: 0.7,
};

function boundaries(group: MuscleGroup, sex: Sex): number[] {
  const base = MEN_BOUNDARIES[group];
  if (sex === "hombre") return base;
  const f = SEX_FACTOR[group];
  return base.map((v) => v * f);
}

export type RankValue = {
  tier: RankId;
  division: number;
  /** % dentro de la division actual (0-100). */
  progress: number;
};

export type ComputedRank =
  | { muscle: MuscleGroup; ranked: false; sessions: number }
  | ({ muscle: MuscleGroup; ranked: true; relStrength: number; sessions: number } & RankValue);

/** Convierte una fuerza relativa en tier + division + progreso. */
export function rankFromRelStrength(
  group: MuscleGroup,
  sex: Sex,
  rel: number,
): RankValue {
  const b = boundaries(group, sex);

  if (rel < b[0]) {
    return { tier: RANK_TIERS[0].id, division: 1, progress: 0 };
  }
  if (rel >= b[5]) {
    const top = RANK_TIERS[RANK_TIERS.length - 1];
    return { tier: top.id, division: top.divisions, progress: 100 };
  }

  let t = 0;
  for (let i = 0; i < 5; i++) if (rel >= b[i]) t = i;

  const lo = b[t];
  const hi = b[t + 1];
  const frac = Math.max(0, Math.min(0.9999, (rel - lo) / (hi - lo)));
  const tier = RANK_TIERS[t];
  const division = Math.min(tier.divisions, Math.floor(frac * tier.divisions) + 1);
  const progress = Math.round((frac * tier.divisions - (division - 1)) * 100);

  return { tier: tier.id, division, progress };
}

/** Orden global de un rango, para comparar si sube o baja. */
export function rankScore(value: RankValue): number {
  const tier = RANK_TIERS.find((t) => t.id === value.tier)!;
  return (tier.order - 1) * 1000 + value.division * 100 + value.progress;
}

/** Calcula el rango de cada grupo a partir del historial de sesiones. */
export function computeRanks(
  sessions: WorkoutSession[],
  bodyweightKg: number,
  sex: Sex,
): ComputedRank[] {
  const groups = Object.keys(MEN_BOUNDARIES) as MuscleGroup[];

  return groups.map((group) => {
    let best = 0;
    const sessionIds = new Set<string>();

    for (const session of sessions) {
      let contributes = false;
      for (const set of session.sets) {
        if (set.grupo !== group || set.weightKg <= 0) continue;
        contributes = true;
        const oneRm = estimate1RM(set.weightKg, set.reps);
        if (oneRm > best) best = oneRm;
      }
      if (contributes) sessionIds.add(session.id);
    }

    const sessionsCount = sessionIds.size;
    if (sessionsCount < MIN_SESSIONS_TO_RANK || best <= 0 || bodyweightKg <= 0) {
      return { muscle: group, ranked: false, sessions: sessionsCount };
    }

    const rel = best / bodyweightKg;
    const rank = rankFromRelStrength(group, sex, rel);
    return {
      muscle: group,
      ranked: true,
      relStrength: rel,
      sessions: sessionsCount,
      ...rank,
    };
  });
}
