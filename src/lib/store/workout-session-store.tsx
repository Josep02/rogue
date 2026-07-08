"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getExerciseInfo,
  useRogue,
  type LogResult,
} from "@/lib/store/rogue-store";
import type { LoggedSet, RoutineDay } from "@/lib/workout/types";

export type SetState = { weightKg: string; reps: string; done: boolean };

type Phase = "active" | "done";

type WorkoutSessionContextValue = {
  active: boolean;
  minimized: boolean;
  phase: Phase;
  day: RoutineDay | null;
  rows: Record<string, SetState[]>;
  result: LogResult | null;
  restUntil: number | null;
  restRemaining: number;
  restTotal: number;
  doneCount: number;
  totalCount: number;
  start: (day: RoutineDay) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  updateSet: (exId: string, i: number, patch: Partial<SetState>) => void;
  toggleDone: (exId: string, i: number, restSec: number) => void;
  addSet: (exId: string) => void;
  removeSet: (exId: string, i: number) => void;
  replaceExercise: (oldExId: string, newExId: string) => void;
  skipRest: () => void;
  finish: () => void;
};

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | null>(
  null,
);

function buildRows(day: RoutineDay): Record<string, SetState[]> {
  const next: Record<string, SetState[]> = {};
  for (const ex of day.exercises) {
    next[ex.exerciseId] = Array.from({ length: ex.sets }, () => ({
      weightKg: ex.suggestedKg ? String(ex.suggestedKg) : "",
      reps: String(ex.reps),
      done: false,
    }));
  }
  return next;
}

export function WorkoutSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logSession } = useRogue();

  const [active, setActive] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [phase, setPhase] = useState<Phase>("active");
  const [day, setDay] = useState<RoutineDay | null>(null);
  const [rows, setRows] = useState<Record<string, SetState[]>>({});
  const [result, setResult] = useState<LogResult | null>(null);

  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  // Cronometro del descanso (anclado a timestamp, se autocorrige en 2.º plano).
  useEffect(() => {
    if (restUntil === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [restUntil]);

  const restRemaining =
    restUntil !== null ? Math.max(0, Math.ceil((restUntil - now) / 1000)) : 0;
  useEffect(() => {
    if (restUntil !== null && now >= restUntil) setRestUntil(null);
  }, [now, restUntil]);

  const start = useCallback((d: RoutineDay) => {
    setDay(d);
    setRows(buildRows(d));
    setPhase("active");
    setResult(null);
    setRestUntil(null);
    setMinimized(false);
    setActive(true);
  }, []);

  const minimize = useCallback(() => setMinimized(true), []);
  const maximize = useCallback(() => setMinimized(false), []);

  const close = useCallback(() => {
    setActive(false);
    setMinimized(false);
    setDay(null);
    setRows({});
    setResult(null);
    setRestUntil(null);
    setPhase("active");
  }, []);

  const updateSet = useCallback(
    (exId: string, i: number, patch: Partial<SetState>) => {
      setRows((prev) => {
        const list = (prev[exId] ?? []).map((s, idx) =>
          idx === i ? { ...s, ...patch } : s,
        );
        return { ...prev, [exId]: list };
      });
    },
    [],
  );

  const toggleDone = useCallback(
    (exId: string, i: number, restSec: number) => {
      let willBeDone = false;
      setRows((prev) => {
        const list = (prev[exId] ?? []).map((s, idx) => {
          if (idx !== i) return s;
          willBeDone = !s.done;
          return { ...s, done: !s.done };
        });
        return { ...prev, [exId]: list };
      });
      if (willBeDone) {
        setRestTotal(restSec);
        setRestUntil(Date.now() + restSec * 1000);
      }
    },
    [],
  );

  const addSet = useCallback((exId: string) => {
    setRows((prev) => {
      const list = prev[exId] ?? [];
      // La nueva serie hereda kg/reps de la ultima para agilizar el registro.
      const last = list[list.length - 1];
      const next: SetState = {
        weightKg: last?.weightKg ?? "",
        reps: last?.reps ?? "",
        done: false,
      };
      return { ...prev, [exId]: [...list, next] };
    });
  }, []);

  const removeSet = useCallback((exId: string, i: number) => {
    setRows((prev) => {
      const list = (prev[exId] ?? []).filter((_, idx) => idx !== i);
      return { ...prev, [exId]: list };
    });
  }, []);

  const replaceExercise = useCallback((oldExId: string, newExId: string) => {
    if (oldExId === newExId) return;
    setDay((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.exerciseId === oldExId ? { ...e, exerciseId: newExId } : e,
            ),
          }
        : prev,
    );
    // Conserva las series ya introducidas bajo el nuevo ejercicio.
    setRows((prev) => {
      if (!(oldExId in prev)) return prev;
      const { [oldExId]: existing, ...rest } = prev;
      return { ...rest, [newExId]: existing };
    });
  }, []);

  const skipRest = useCallback(() => setRestUntil(null), []);

  const finish = useCallback(() => {
    if (!day) return;
    const sets: LoggedSet[] = [];
    for (const ex of day.exercises) {
      const info = getExerciseInfo(ex.exerciseId);
      for (const s of rows[ex.exerciseId] ?? []) {
        if (!s.done) continue;
        const reps = Number(s.reps) || 0;
        if (reps <= 0) continue;
        sets.push({
          exerciseId: ex.exerciseId,
          grupo: info.grupo,
          weightKg: Number(s.weightKg) || 0,
          reps,
        });
      }
    }
    if (sets.length === 0) return;
    setResult(logSession(day.label, sets));
    setRestUntil(null);
    setMinimized(false);
    setPhase("done");
  }, [day, rows, logSession]);

  const { doneCount, totalCount } = useMemo(() => {
    const all = Object.values(rows).flat();
    return {
      doneCount: all.filter((s) => s.done).length,
      totalCount: all.length,
    };
  }, [rows]);

  const value: WorkoutSessionContextValue = {
    active,
    minimized,
    phase,
    day,
    rows,
    result,
    restUntil,
    restRemaining,
    restTotal,
    doneCount,
    totalCount,
    start,
    minimize,
    maximize,
    close,
    updateSet,
    toggleDone,
    addSet,
    removeSet,
    replaceExercise,
    skipRest,
    finish,
  };

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession(): WorkoutSessionContextValue {
  const ctx = useContext(WorkoutSessionContext);
  if (!ctx)
    throw new Error(
      "useWorkoutSession debe usarse dentro de WorkoutSessionProvider",
    );
  return ctx;
}
