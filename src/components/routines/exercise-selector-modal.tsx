"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Search, X, ChevronRight, Info } from "lucide-react";
import { DEMO_EXERCISES, EXERCISE_IMG_BASE } from "@/lib/exercises/repo";
import type { Exercise } from "@/lib/exercises/types";
import type { MuscleGroup } from "@/lib/ranks";
import { cn } from "@/lib/utils";

const GROUPS: MuscleGroup[] = [
  "Pecho", "Espalda", "Hombros", "Biceps", "Triceps", "Piernas", "Gluteos", "Core",
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  excludeIds?: string[];
};

// ── Fila expandible ─────────────────────────────────────────────────────────
function ExerciseItem({
  ex,
  already,
  onSelect,
}: {
  ex: Exercise;
  already: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const img0 = `${EXERCISE_IMG_BASE}/${ex.fuenteId}/0.jpg`;
  const img1 = `${EXERCISE_IMG_BASE}/${ex.fuenteId}/1.jpg`;

  return (
    <div className={cn("border-b border-border last:border-0", already && "opacity-40")}>
      {/* Fila principal */}
      <div className="flex items-center gap-2 py-3">
        <button
          disabled={already}
          onClick={onSelect}
          className="flex flex-1 flex-col text-left"
        >
          <p className="text-sm font-medium">{ex.nombre}</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {ex.grupo} · {ex.equipo}
          </p>
        </button>

        {already ? (
          <span className="font-mono text-[10px] text-muted-foreground">Añadido</span>
        ) : (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                expanded
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Info className="size-3.5" />
            </button>
            <button onClick={onSelect} className="text-muted-foreground">
              <ChevronRight className="size-4 shrink-0" />
            </button>
          </>
        )}
      </div>

      {/* Panel expandido */}
      {expanded && !already && (
        <div className="pb-3">
          {/* Animación 2 frames */}
          <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src={img0}
              alt={`${ex.nombre} inicio`}
              fill
              className="object-cover [animation:ex-frame_1.2s_step-end_infinite]"
              unoptimized
            />
            <Image
              src={img1}
              alt={`${ex.nombre} fin`}
              fill
              className="object-cover opacity-0 [animation:ex-frame-alt_1.2s_step-end_infinite]"
              unoptimized
            />
          </div>

          {/* Instrucciones */}
          {ex.instrucciones.length > 0 && (
            <ol className="flex flex-col gap-1.5">
              {ex.instrucciones.map((step, i) => (
                <li key={i} className="flex gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono font-bold text-foreground shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────
export function ExerciseSelectorModal({ open, onClose, onSelect, excludeIds = [] }: Props) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "">("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setGroup("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return DEMO_EXERCISES.filter((ex) => {
      if (group && ex.grupo !== group) return false;
      if (q) {
        const name = ex.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [query, group]);

  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  useEffect(() => {
    setPortalTarget(document.getElementById("app-shell"));
  }, []);

  if (!open) return null;

  const content = (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[88dvh] flex-col rounded-t-3xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-semibold">Añadir ejercicio</p>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Group chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
          <button
            onClick={() => setGroup("")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-colors",
              group === ""
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g === group ? "" : g)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-colors",
                group === g
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay ejercicios con esos filtros
            </p>
          ) : (
            <div className="flex flex-col">
              {filtered.map((ex) => (
                <ExerciseItem
                  key={ex.id}
                  ex={ex}
                  already={excludeIds.includes(ex.id)}
                  onSelect={() => { onSelect(ex); onClose(); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return portalTarget ? createPortal(content, portalTarget) : content;
}
