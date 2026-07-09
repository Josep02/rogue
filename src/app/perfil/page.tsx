"use client";

import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  LogOut,
  RotateCcw,
  Shield,
  Weight,
} from "lucide-react";
import Link from "next/link";
import { PastelCard } from "@/components/ui/pastel-card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SwitchRow,
  UnitToggle,
} from "@/components/profile/preference-controls";
import { useRogue } from "@/lib/store/rogue-store";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  );
}

function RowCard({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <PastelCard variant="neutral" className="flex flex-col divide-y divide-border p-0">
      {rows.map((row) => (
        <button
          key={row.label}
          type="button"
          className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
        >
          <span className="text-sm">{row.label}</span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-sm text-muted-foreground">
              {row.value}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>
      ))}
    </PastelCard>
  );
}

export default function PerfilPage() {
  const { profile, sessions, ranks, resetAll } = useRogue();

  const initials =
    profile.name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "R";
  const rankedCount = ranks.filter((r) => r.ranked).length;

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="relative flex shrink-0 items-center px-4 py-2 pt-10">
        <Link 
          href="/" 
          aria-label="Volver atrás" 
          className="flex size-10 z-10 items-center justify-center rounded-full bg-surface border border-border shadow-sm text-muted-foreground transition-all hover:bg-muted active:scale-95"
        >
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <span className="absolute inset-0 flex items-center justify-center pt-10 text-sm font-semibold pointer-events-none">
          Perfil
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-8 pt-2">
        <div className="flex flex-col items-center text-center gap-3 pt-2 pb-2">
        <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-semibold text-accent-foreground shadow-sm">
          {initials}
        </span>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.name || "Atleta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Objetivo: {profile.goal}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <PastelCard variant="neutral" className="flex flex-col gap-1.5">
          <Flame className="size-4 text-muted-foreground" />
          <p className="font-mono text-lg font-medium leading-none">
            {sessions.length}
          </p>
          <p className="text-[11px] text-muted-foreground">entrenos</p>
        </PastelCard>
        <PastelCard variant="neutral" className="flex flex-col gap-1.5">
          <Shield className="size-4 text-muted-foreground" />
          <p className="font-mono text-lg font-medium leading-none">
            {rankedCount}
          </p>
          <p className="text-[11px] text-muted-foreground">rangos</p>
        </PastelCard>
        <PastelCard variant="neutral" className="flex flex-col gap-1.5">
          <Weight className="size-4 text-muted-foreground" />
          <p className="font-mono text-lg font-medium leading-none">
            {profile.bodyweightKg}
            <span className="text-xs font-normal">kg</span>
          </p>
          <p className="text-[11px] text-muted-foreground">peso</p>
        </PastelCard>
      </div>

      <Section title="DATOS FISICOS">
        <RowCard
          rows={[
            { label: "Peso corporal", value: `${profile.bodyweightKg} kg` },
            { label: "Altura", value: `${profile.heightCm} cm` },
            { label: "Sexo", value: profile.sex },
            { label: "Objetivo", value: profile.goal },
          ]}
        />
        <p className="px-1 text-[11px] text-muted-foreground">
          El peso corporal y el sexo se usan para calcular tus rangos de fuerza.
        </p>
      </Section>

      <Section title="APARIENCIA">
        <ThemeToggle />
      </Section>

      <Section title="UNIDADES">
        <UnitToggle />
      </Section>

      <Section title="NOTIFICACIONES">
        <PastelCard variant="neutral" className="flex flex-col divide-y divide-border p-0">
          <SwitchRow
            label="Recordatorios de entreno"
            description="Avisos de tu sesion del dia"
            defaultOn
          />
          <SwitchRow
            label="Temporizador de descanso"
            description="Sonido al acabar el descanso"
            defaultOn
          />
          <SwitchRow
            label="Resumen semanal"
            description="Progreso y rangos cada domingo"
          />
        </PastelCard>
      </Section>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={resetAll}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Reiniciar datos de demo
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Cerrar sesion
        </button>
      </div>
      </div>
    </div>
  );
}
