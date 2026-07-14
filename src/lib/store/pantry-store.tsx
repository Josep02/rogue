"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Alimento = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  isFavorite: boolean;
  healthScore?: "green" | "yellow" | "orange" | "red";
};

export type PlatoFood = {
  alimentoId: string;
  quantityG: number;
};

export type Plato = {
  id: string;
  name: string;
  kcal: number;
  foods: PlatoFood[];
  isFavorite: boolean;
  healthScore?: "green" | "yellow" | "orange" | "red";
};

type PantryContextType = {
  alimentos: Alimento[];
  platos: Plato[];
  addAlimento: (a: Omit<Alimento, "id" | "isFavorite">) => void;
  updateAlimento: (id: string, data: Partial<Alimento>) => void;
  deleteAlimento: (id: string) => void;
  addPlato: (p: Omit<Plato, "id" | "isFavorite">) => void;
  updatePlato: (id: string, data: Partial<Plato>) => void;
  deletePlato: (id: string) => void;
  toggleFavoriteAlimento: (id: string) => void;
  toggleFavoritePlato: (id: string) => void;
};

const DEMO_ALIMENTOS: Alimento[] = [
  { id: "1", name: "Pechuga de pollo", kcal: 165, protein: 31, carbs: 0, fat: 3.6, isFavorite: false, healthScore: "green" },
  { id: "2", name: "Arroz blanco", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, isFavorite: false, healthScore: "yellow" },
  { id: "3", name: "Patata", kcal: 86, protein: 1.7, carbs: 20, fat: 0.1, isFavorite: false, healthScore: "green" },
  { id: "4", name: "Tomate", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, isFavorite: false, healthScore: "green" },
  { id: "5", name: "Pasta", kcal: 131, protein: 5, carbs: 25, fat: 1, isFavorite: false, healthScore: "yellow" },
  { id: "6", name: "Bacon", kcal: 541, protein: 37, carbs: 1.4, fat: 42, isFavorite: false, healthScore: "red" },
  { id: "7", name: "Chocolate con leche", kcal: 535, protein: 7.6, carbs: 59, fat: 30, isFavorite: false, healthScore: "red" },
  { id: "8", name: "Manzana", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, isFavorite: false, healthScore: "green" },
  { id: "9", name: "Aceite de Oliva", kcal: 884, protein: 0, carbs: 0, fat: 100, isFavorite: false, healthScore: "orange" }, // High calories makes the heuristic flag it, but user can override
];

const DEMO_PLATOS: Plato[] = [
  { 
    id: "p1", name: "Pollo con arroz y tomate", kcal: 443, 
    foods: [{ alimentoId: "1", quantityG: 200 }, { alimentoId: "2", quantityG: 80 }, { alimentoId: "4", quantityG: 50 }], 
    isFavorite: false,
    healthScore: "green"
  },
  { 
    id: "p2", name: "Macarrones con tomate", kcal: 185, 
    foods: [{ alimentoId: "5", quantityG: 100 }, { alimentoId: "4", quantityG: 300 }], 
    isFavorite: false,
    healthScore: "yellow"
  },
  { 
    id: "p3", name: "Pollo asado con patatas", kcal: 542, 
    foods: [{ alimentoId: "1", quantityG: 250 }, { alimentoId: "3", quantityG: 150 }], 
    isFavorite: false,
    healthScore: "green"
  },
  { 
    id: "p4", name: "Bacon con patatas", kcal: 800, 
    foods: [{ alimentoId: "6", quantityG: 100 }, { alimentoId: "3", quantityG: 300 }], 
    isFavorite: false,
    healthScore: "red"
  },
];

const PantryContext = createContext<PantryContextType | null>(null);

export function PantryProvider({ children }: { children: ReactNode }) {
  const [alimentos, setAlimentos] = useState<Alimento[]>(DEMO_ALIMENTOS);
  const [platos, setPlatos] = useState<Plato[]>(DEMO_PLATOS);

  const addAlimento = (a: Omit<Alimento, "id" | "isFavorite">) => {
    setAlimentos(prev => [{ ...a, id: Date.now().toString(), isFavorite: false }, ...prev]);
  };
  const updateAlimento = (id: string, data: Partial<Alimento>) => {
    setAlimentos(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };
  const deleteAlimento = (id: string) => {
    setAlimentos(prev => prev.filter(a => a.id !== id));
  };

  const addPlato = (p: Omit<Plato, "id" | "isFavorite">) => {
    setPlatos(prev => [{ ...p, id: Date.now().toString(), isFavorite: false }, ...prev]);
  };
  const updatePlato = (id: string, data: Partial<Plato>) => {
    setPlatos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const deletePlato = (id: string) => {
    setPlatos(prev => prev.filter(p => p.id !== id));
  };

  const toggleFavoriteAlimento = (id: string) => {
    setAlimentos(prev => prev.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a));
  };
  const toggleFavoritePlato = (id: string) => {
    setPlatos(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  return (
    <PantryContext.Provider value={{
      alimentos, platos, addAlimento, updateAlimento, deleteAlimento, addPlato, updatePlato, deletePlato, toggleFavoriteAlimento, toggleFavoritePlato
    }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error("usePantry must be used within PantryProvider");
  return ctx;
}
