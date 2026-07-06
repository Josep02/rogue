"use client";

import { Lock } from "lucide-react";
import { RankBadge } from "@/components/ui/rank-badge";
import { PastelCard } from "@/components/ui/pastel-card";
import { useRogue } from "@/lib/store/rogue-store";
import { MIN_SESSIONS_TO_RANK, type ComputedRank } from "@/lib/rank-engine";
import {
  getDivisionLabel,
  RANK_STYLES,
  RANK_TIERS,
  getNextRankTier,
  getRankTier,
} from "@/lib/ranks";

function RankExplainer() {
  return (
    <PastelCard variant="neutral" className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
          COMO FUNCIONAN
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          Cada grupo muscular tiene su{" "}
          <span className="font-semibold">rango propio</span>, segun tu fuerza
          relativa: tu mejor levantamiento estimado (1RM) dividido entre tu peso
          corporal, comparado con estandares de fuerza. Sube registrando
          sesiones y batiendo tus marcas.
        </p>
      </div>

      <div className="flex items-end justify-between gap-1">
        {RANK_TIERS.map((tier) => {
          const family = RANK_STYLES[tier.id].colorFamily;
          return (
            <div
              key={tier.id}
              className="flex flex-1 flex-col items-center gap-1 text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/ranks/${family}-1.svg`} alt="" className="size-9" />
              <p className="text-[10px] font-medium leading-none">{tier.label}</p>
              <p className="font-mono text-[9px] leading-none text-muted-foreground">
                {tier.divisions} div.
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Cada tier se divide en divisiones (I la mas baja). Los 8 musculos son
        independientes: puedes ser Oro en pecho y Maestro en pierna.
      </p>
    </PastelCard>
  );
}

function RankCard({ rank }: { rank: ComputedRank }) {
  if (!rank.ranked) {
    const faltan = MIN_SESSIONS_TO_RANK - rank.sessions;
    return (
      <PastelCard
        variant="neutral"
        className="flex flex-col items-center gap-2 text-center"
      >
        <span className="flex size-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground ring-1 ring-border">
          <Lock className="size-7" />
        </span>
        <p className="text-sm font-semibold">{rank.muscle}</p>
        <p className="font-mono text-xs text-muted-foreground">SIN RANGO</p>
        <p className="text-[11px] text-muted-foreground">
          {faltan > 0
            ? `Entrena ${faltan} sesion${faltan === 1 ? "" : "es"} mas`
            : "Registra carga para desbloquear"}
        </p>
      </PastelCard>
    );
  }

  const tier = getRankTier(rank.tier);
  const next = getNextRankTier(rank.tier);
  const style = RANK_STYLES[rank.tier];
  const atLastDivision = rank.division >= tier.divisions;
  const isMaxRank = atLastDivision && !next;

  return (
    <PastelCard
      variant="neutral"
      className="flex flex-col items-center gap-2 text-center"
    >
      <RankBadge tier={rank.tier} division={rank.division} size="md" />
      <p className="text-sm font-semibold">{rank.muscle}</p>
      <p className={`font-mono text-xs ${style.text}`}>
        {tier.label.toUpperCase()} · {getDivisionLabel(tier, rank.division)}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${rank.progress}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {isMaxRank
          ? "Rango maximo"
          : `${rank.progress}% hacia ${
              atLastDivision && next ? next.label : "siguiente division"
            }`}
      </p>
    </PastelCard>
  );
}

export default function RangosPage() {
  const { ranks } = useRogue();
  const ranked = ranks.filter((r) => r.ranked).length;

  return (
    <div className="flex flex-col gap-5 pt-2 pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tus Rangos</h1>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
          {ranked} DE {ranks.length} GRUPOS CON RANGO
        </p>
      </div>

      <RankExplainer />

      <div className="grid grid-cols-2 gap-3">
        {ranks.map((rank) => (
          <RankCard key={rank.muscle} rank={rank} />
        ))}
      </div>
    </div>
  );
}
