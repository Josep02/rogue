"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Trophy, X } from "lucide-react";
import { RankBadge } from "@/components/ui/rank-badge";
import { PastelCard } from "@/components/ui/pastel-card";
import {
  getExerciseInfo,
  useRogue,
  type LogResult,
} from "@/lib/store/rogue-store";
import { getDivisionLabel, getRankTier } from "@/lib/ranks";
import type { LoggedSet } from "@/lib/workout/types";
import { cn } from "@/lib/utils";

type SetState = { weightKg: string; reps: string; done: boolean };

export default function EntrenarPage() {
  const { hydrated, todayDay, logSession } = useRogue();
  const router = useRouter();

  const [rows, setRows] = useState<Record<string, SetState[]>>({});
  const [initFor, setInitFor] = useState<string | null>(null);
  const [phase, setPhase] = useState<"active" | "done">("active");
  const [result, setResult] = useState<LogResult | null>(null);

  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hydrated || initFor === todayDay.id) return;
    const next: Record<string, SetState[]> = {};
    for (const ex of todayDay.exercises) {
      next[ex.exerciseId] = Array.from({ length: ex.sets }, () => ({
        weightKg: ex.suggestedKg ? String(ex.suggestedKg) : "",
        reps: String(ex.reps),
        done: false,
      }));
    }
    setRows(next);
    setInitFor(todayDay.id);
  }, [hydrated, todayDay, initFor]);

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

  function updateSet(exId: string, i: number, patch: Partial<SetState>) {
    setRows((prev) => {
      const list = prev[exId].map((s, idx) => (idx === i ? { ...s, ...patch } : s));
      return { ...prev, [exId]: list };
    });
  }

  function toggleDone(exId: string, i: number, restSec: number) {
    const wasDone = rows[exId][i].done;
    updateSet(exId, i, { done: !wasDone });
    if (!wasDone) {
      setRestTotal(restSec);
      setRestUntil(Date.now() + restSec * 1000);
    }
  }

  const allSets = Object.values(rows).flat();
  const doneCount = allSets.filter((s) => s.done).length;
  const totalCount = allSets.length;

  function finish() {
    const sets: LoggedSet[] = [];
    for (const ex of todayDay.exercises) {
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
    setResult(logSession(todayDay.label, sets));
    setPhase("done");
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="flex min-h-dvh flex-col gap-5 px-5 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-center gap-2 pt-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Trophy className="size-8" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sesion completada
          </h1>
          <p className="text-sm text-muted-foreground">
            {todayDay.label} · {result.session.sets.length} series registradas
          </p>
        </div>

        {result.rankChanges.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
              RANGO SUBE
            </p>
            {result.rankChanges.map((c) => {
              const after = c.after;
              if (!after.ranked) return null;
              const tier = getRankTier(after.tier);
              return (
                <PastelCard
                  key={c.muscle}
                  variant="lilac"
                  className="flex items-center gap-3"
                >
                  <RankBadge tier={after.tier} division={after.division} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{c.muscle}</p>
                    <p className="font-mono text-xs opacity-80">
                      {c.newlyRanked ? "Primer rango · " : "Sube a "}
                      {tier.label} {getDivisionLabel(tier, after.division)}
                    </p>
                  </div>
                </PastelCard>
              );
            })}
          </div>
        )}

        {result.prs.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
              MARCAS PERSONALES
            </p>
            {result.prs.map((pr) => (
              <PastelCard
                key={pr.exerciseId}
                variant="neutral"
                className="flex items-center justify-between"
              >
                <span className="text-sm">{pr.nombre}</span>
                <span className="font-mono text-sm text-muted-foreground">
                  1RM {pr.est1RM} kg
                </span>
              </PastelCard>
            ))}
          </div>
        )}

        {result.rankChanges.length === 0 && result.prs.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Sesion guardada. Sigue asi para subir de rango.
          </p>
        )}

        <button
          type="button"
          onClick={() => router.replace("/")}
          className="mt-auto flex items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-medium text-accent-foreground"
        >
          Volver al inicio
          <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between px-5 py-2">
        <button
          type="button"
          onClick={() => router.replace("/")}
          aria-label="Salir del entreno"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">{todayDay.label}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {doneCount}/{totalCount} series
          </p>
        </div>
        <span className="size-9" />
      </header>

      <div className="flex flex-col gap-4 px-5 pt-2">
        {todayDay.exercises.map((ex) => {
          const info = getExerciseInfo(ex.exerciseId);
          return (
            <div
              key={ex.exerciseId}
              className="rounded-3xl border border-border bg-surface p-4"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-sm font-semibold">{info.nombre}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {info.grupo}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {(rows[ex.exerciseId] ?? []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-8 font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                    <label className="flex flex-1 items-center gap-1 rounded-xl bg-muted/60 px-3 py-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={s.weightKg}
                        onChange={(e) =>
                          updateSet(ex.exerciseId, i, { weightKg: e.target.value })
                        }
                        placeholder="0"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">kg</span>
                    </label>
                    <label className="flex flex-1 items-center gap-1 rounded-xl bg-muted/60 px-3 py-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={s.reps}
                        onChange={(e) =>
                          updateSet(ex.exerciseId, i, { reps: e.target.value })
                        }
                        placeholder="0"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">reps</span>
                    </label>
                    <button
                      type="button"
                      aria-label="Completar serie"
                      onClick={() => toggleDone(ex.exerciseId, i, ex.restSec)}
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                        s.done
                          ? "border-foreground bg-accent text-accent-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {restUntil !== null && (
          <div className="pointer-events-auto mx-auto w-full max-w-sm rounded-2xl border border-border bg-surface/90 px-4 py-2.5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Descanso</span>
              <span className="font-mono font-medium">{restRemaining}s</span>
              <button
                type="button"
                onClick={() => setRestUntil(null)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Saltar
              </button>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{
                  width: `${restTotal ? (restRemaining / restTotal) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
        <button
          type="button"
          disabled={doneCount === 0}
          onClick={finish}
          className="pointer-events-auto mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-medium text-accent-foreground transition-opacity disabled:opacity-40"
        >
          Finalizar entreno
          <Check className="size-4" />
        </button>
      </div>
    </div>
  );
}
