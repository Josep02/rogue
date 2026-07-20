"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Circle, X, Plus, Trash2, Search, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePantry, isReadyPlato } from "@/lib/store/pantry-store";
import { useMeals, type MealType, type MealEntry, entryMacros, sumMacros, dayKey } from "@/lib/store/meals-store";

const HEALTH_DOT: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

type Props = {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  mealLabel: string;
  date: string; // YYYY-MM-DD
};

export function MealSheet({ open, onClose, mealType, mealLabel, date }: Props) {
  const { alimentos, platos } = usePantry();
  const { entriesForDay, addEntry, removeEntry, updateEntryQuantity, updateEntry } = useMeals();
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [view, setView] = useState<"list" | "add">("list");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPortalTarget(document.getElementById("app-shell"));
  }, []);

  useEffect(() => {
    if (!open) { setView("list"); setSearch(""); }
  }, [open]);

  const entries = entriesForDay(date).filter(e => e.mealType === mealType);
  const totals = useMemo(() => sumMacros(entries), [entries]);

  const isToday = date === dayKey();
  const dateLabel = isToday
    ? "Hoy"
    : new Date(`${date}T00:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });

  const filteredAlimentos = useMemo(() =>
    alimentos.filter(a => a.name.toLowerCase().includes(search.toLowerCase())),
    [alimentos, search]
  );
  const filteredPlatos = useMemo(() =>
    platos.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [platos, search]
  );

  const addAlimentoToMeal = (alimentoId: string) => {
    const a = alimentos.find(x => x.id === alimentoId);
    if (!a) return;
    addEntry({
      date, mealType, name: a.name, brand: null, barcode: null,
      // Racion del producto si OFF la dio; si no, 100 g.
      quantityG: a.servingG && a.servingG > 0 ? a.servingG : 100,
      kcal100: a.kcal, protein100: a.protein, fat100: a.fat, carbs100: a.carbs,
      eaten: false,
    });
    setView("list"); setSearch("");
  };

  const addPlatoToMeal = (platoId: string) => {
    const p = platos.find(x => x.id === platoId);
    if (!p) return;

    // Plato "listo" (producto escaneado): sus macros ya son por 100 g y no tiene
    // ingredientes enlazados, asi que se registra como un alimento normal (por
    // gramos, sin desglose editable). Cantidad inicial: 100 g.
    if (isReadyPlato(p)) {
      addEntry({
        date, mealType, name: p.name, brand: null, barcode: null,
        // Racion del producto si OFF la dio; si no, 100 g.
        quantityG: p.servingG && p.servingG > 0 ? p.servingG : 100,
        kcal100: p.kcal, protein100: p.protein ?? 0, fat100: p.fat ?? 0, carbs100: p.carbs ?? 0,
        eaten: false,
      });
      setView("list"); setSearch("");
      return;
    }

    let totalP = 0, totalC = 0, totalF = 0, totalKcal = 0, totalWeight = 0;
    const breakdown = p.foods.map(f => {
      const a = alimentos.find(x => x.id === f.alimentoId);
      const name = a ? a.name : "Desconocido";
      const kcal100 = a ? a.kcal : 0;
      const p100 = a ? a.protein : 0;
      const c100 = a ? a.carbs : 0;
      const f100 = a ? a.fat : 0;
      const factor = f.quantityG / 100;
      totalKcal += kcal100 * factor;
      totalP += p100 * factor;
      totalC += c100 * factor;
      totalF += f100 * factor;
      totalWeight += f.quantityG;
      return { id: f.alimentoId, name, quantityG: f.quantityG, kcal100, p100, c100, f100 };
    });

    // Los campos *_100 son por 100 g: se normalizan por el peso real del
    // plato para que entryMacros (quantityG/100 * kcal100) devuelva el total
    // exacto y la cantidad mostrada sea el peso de verdad.
    const per100 = totalWeight > 0 ? 100 / totalWeight : 0;
    addEntry({
      date, mealType, name: p.name,
      brand: null,
      barcode: "__plato__:" + JSON.stringify(breakdown), // Store breakdown for individual editing
      quantityG: Math.round(totalWeight),
      kcal100: totalKcal * per100,
      protein100: totalP * per100,
      fat100: totalF * per100,
      carbs100: totalC * per100,
      eaten: false,
    });
    setView("list"); setSearch("");
  };

  if (!open || !portalTarget) return null;

  const content = (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="w-full px-5 md:w-full md:max-w-lg md:px-0">
        <div
          className="flex max-h-[90dvh] flex-col rounded-t-3xl border border-border bg-background shadow-2xl md:max-h-[80dvh] md:rounded-3xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <div>
              <p className="font-semibold">{mealLabel}</p>
              <p className="text-xs text-muted-foreground font-mono">{dateLabel.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              {view === "list" ? (
                <button
                  onClick={() => setView("add")}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  <Plus className="size-3.5" /> Añadir
                </button>
              ) : (
                <button onClick={() => setView("list")} className="text-xs text-muted-foreground underline">
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex size-10 items-center justify-center rounded-full bg-surface hover:bg-muted transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Totals */}
          {entries.length > 0 && (
            <div className="mx-5 mb-3 flex gap-3 rounded-2xl bg-surface px-4 py-2.5 text-xs">
              <span className="font-semibold">{Math.round(totals.kcal)} kcal</span>
              <span className="text-muted-foreground">P: {Math.round(totals.protein)}g</span>
              <span className="text-muted-foreground">C: {Math.round(totals.carbs)}g</span>
              <span className="text-muted-foreground">G: {Math.round(totals.fat)}g</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {view === "list" && (
              <div className="flex flex-col gap-2">
                {entries.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    <p>Este apartado está vacío.</p>
                    <button
                      onClick={() => setView("add")}
                      className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
                    >
                      + Añadir alimento o plato
                    </button>
                  </div>
                )}
                {entries.map(entry => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    macros={entryMacros(entry)}
                    onRemove={removeEntry}
                    onQuantityChange={updateEntryQuantity}
                    onUpdateEntry={updateEntry}
                  />
                ))}
              </div>
            )}

            {view === "add" && (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar alimento o plato..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {search && <button onClick={() => setSearch("")}><X className="size-3.5 text-muted-foreground" /></button>}
                </label>

                {filteredPlatos.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-mono text-xs tracking-[0.2em] text-muted-foreground">PLATOS</p>
                    <div className="flex flex-col gap-2.5">
                      {filteredPlatos.map(p => (
                        <div
                          key={p.id}
                          onClick={() => addPlatoToMeal(p.id)}
                          className="flex items-center gap-3 rounded-3xl border border-border bg-surface p-3 cursor-pointer hover:bg-muted transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                              {p.name}
                              {p.healthScore && <span className={cn("size-2 rounded-full shrink-0", HEALTH_DOT[p.healthScore])} />}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isReadyPlato(p)
                                ? `${Math.round(p.kcal)} kcal/100g · ${(p.ingredients ?? []).length} ingredientes`
                                : `${p.kcal} kcal · ${p.foods.length} ingredientes`}
                            </p>
                          </div>
                          <Plus className="size-4 shrink-0 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredAlimentos.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-mono text-xs tracking-[0.2em] text-muted-foreground">ALIMENTOS</p>
                    <div className="flex flex-col gap-2.5">
                      {filteredAlimentos.map(a => (
                        <div
                          key={a.id}
                          onClick={() => addAlimentoToMeal(a.id)}
                          className="flex items-center gap-3 rounded-3xl border border-border bg-surface p-3 cursor-pointer hover:bg-muted transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                              {a.name}
                              {a.healthScore && <span className={cn("size-2 rounded-full shrink-0", HEALTH_DOT[a.healthScore])} />}
                            </p>
                            <p className="text-xs text-muted-foreground">{a.kcal} kcal/100g · P:{a.protein}g C:{a.carbs}g G:{a.fat}g</p>
                          </div>
                          <Plus className="size-4 shrink-0 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPlatos.length === 0 && filteredAlimentos.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados para "{search}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, portalTarget);
}

function EntryRow({
  entry, macros, onRemove, onQuantityChange, onUpdateEntry
}: {
  entry: MealEntry;
  macros: ReturnType<typeof entryMacros>;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, q: number) => void;
  onUpdateEntry: (id: string, data: any) => void;
}) {
  const isPlato = entry.barcode?.startsWith("__plato__:");
  const breakdown = useMemo(() => {
    if (!isPlato) return [];
    try {
      return JSON.parse(entry.barcode!.replace("__plato__:", ""));
    } catch {
      return [];
    }
  }, [entry.barcode, isPlato]);

  const [editing, setEditing] = useState(false);
  
  // State for simple Alimento (g)
  const [draftQty, setDraftQty] = useState(() => entry.quantityG.toString());
  
  // State for Plato breakdown
  const [draftBreakdown, setDraftBreakdown] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftQty(entry.quantityG.toString());
    if (isPlato) {
      const obj: Record<string, string> = {};
      breakdown.forEach((b: any, i: number) => obj[i] = b.quantityG.toString());
      setDraftBreakdown(obj);
    }
  }, [entry.quantityG, breakdown, isPlato]);

  const handleSaveSimple = () => {
    const n = Number(draftQty);
    if (n > 0) onQuantityChange(entry.id, Math.round(n));
    setEditing(false);
  };

  const handleSavePlato = () => {
    // Recalculate totals
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0, totalQty = 0;
    const newBreakdown = breakdown.map((b: any, i: number) => {
      const n = Number(draftBreakdown[i]);
      const qty = isNaN(n) || n < 0 ? 0 : Math.round(n);
      const factor = qty / 100;
      totalKcal += b.kcal100 * factor;
      totalP += b.p100 * factor;
      totalC += b.c100 * factor;
      totalF += b.f100 * factor;
      totalQty += qty;
      return { ...b, quantityG: qty };
    });

    // Igual que al añadir el plato: *_100 normalizado por el peso total. Sin
    // esto, guardar quantityG = peso total junto a los macros absolutos
    // multiplicaba las kcal mostradas por (peso/100).
    const per100 = totalQty > 0 ? 100 / totalQty : 0;
    onUpdateEntry(entry.id, {
      barcode: "__plato__:" + JSON.stringify(newBreakdown),
      quantityG: totalQty,
      kcal100: totalKcal * per100,
      protein100: totalP * per100,
      carbs100: totalC * per100,
      fat100: totalF * per100,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraftQty(entry.quantityG.toString());
    if (isPlato) {
      const obj: Record<string, string> = {};
      breakdown.forEach((b: any, i: number) => obj[i] = b.quantityG.toString());
      setDraftBreakdown(obj);
    }
    setEditing(false);
  };

  const totalWeightStr = isPlato ? Math.round(breakdown.reduce((acc: number, b: any) => acc + b.quantityG, 0)) + "g" : `${entry.quantityG}g`;

  const handleToggleEaten = () => {
    onUpdateEntry(entry.id, { eaten: !entry.eaten });
  };

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-surface transition-opacity", !entry.eaten && "opacity-60")}>
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          aria-label="Marcar como comido"
          onClick={handleToggleEaten}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors active:scale-95",
            entry.eaten
              ? "border-foreground bg-accent text-accent-foreground"
              : "border-border text-muted-foreground",
          )}
        >
          <Check className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{entry.name}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(macros.kcal)} kcal
            <span className="ml-1.5 opacity-60">· {totalWeightStr}</span>
          </p>
        </div>
        <button
          onClick={() => setEditing(v => !v)}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors",
            editing ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Pencil className="size-4" />
        </button>
        <button
          onClick={() => onRemove(entry.id)}
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Edit panel */}
      {editing && !isPlato && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground flex-1">Cantidad (g)</span>
          <input
            autoFocus
            type="number"
            value={draftQty}
            step="1"
            min="1"
            onChange={e => setDraftQty(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSaveSimple(); if (e.key === "Escape") handleCancel(); }}
            className="w-20 rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-right outline-none"
          />
          <span className="text-xs text-muted-foreground w-7">g</span>
          <button
            onClick={handleSaveSimple}
            className="flex size-8 items-center justify-center rounded-full bg-foreground text-background hover:opacity-80 transition-opacity"
          >
            <Check className="size-4" />
          </button>
          <button onClick={handleCancel} className="flex size-8 items-center justify-center rounded-full bg-surface hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>
      )}

      {editing && isPlato && (
        <div className="flex flex-col gap-2 border-t border-border">
          <div className="p-4 flex flex-col gap-2">
            {breakdown.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-1 truncate">{b.name}</span>
                <input
                  type="number"
                  value={draftBreakdown[i] || ""}
                  onChange={(e) => setDraftBreakdown(prev => ({ ...prev, [i]: e.target.value }))}
                  className="w-16 rounded-xl border border-border bg-background px-2 py-1.5 text-sm text-right outline-none"
                />
                <span className="text-xs text-muted-foreground w-4">g</span>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3 p-4 pt-0">
            <button type="button" onClick={handleCancel} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-muted transition-colors">
              <X className="size-4 text-muted-foreground" />
            </button>
            <Button onClick={handleSavePlato} className="flex-1">
              Guardar Plato
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
