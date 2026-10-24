import { Link } from "@tanstack/react-router";
import { Droplet, GlassWater, Milk, Plus, Target, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { progress } from "@/domain/nutrition/calculations";
import type { ISODate } from "@/domain/nutrition/types";
import {
  sortWaterEntries,
  validateWaterMl,
  WATER_CUP_ML,
  WATER_QUICK_ML,
  waterTotal,
} from "@/domain/nutrition/water";
import { useGoalsOn } from "@/features/goals/api";
import { useToday } from "@/features/profile/api";
import { useAddWater, useRemoveWater, useWaterOn } from "@/features/water/api";
import { formatDate } from "@/lib/dates";
import { formatNumber, parseDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

const QUICK_ICON = { 200: GlassWater, 500: Milk } as const;
const QUICK_LABEL = { 200: "Copo", 500: "Garrafa" } as const;

const liters = (ml: number) => `${formatNumber(ml / 1000, 2)} L`;

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Mensagem de erro para a quantidade digitada, ou null se estiver válida. */
function waterInputError(ml: number): string | null {
  try {
    validateWaterMl(ml);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Quantidade inválida.";
  }
}

/** Água do dia: total, meta em copos, registro rápido e lista de registros. */
export function WaterCard({ date }: { date: ISODate }) {
  const today = useToday();
  const water = useWaterOn(date);
  const goals = useGoalsOn(date);
  const addWater = useAddWater();
  const removeWater = useRemoveWater();
  const [custom, setCustom] = useState("");
  const [open, setOpen] = useState(false);

  const entries = water.data ?? [];
  const total = waterTotal(entries);
  const goal = goals.data?.waterMl;
  const p = goal ? progress(total, goal) : null;
  const cups = goal ? Math.ceil(goal / WATER_CUP_ML) : 0;
  const filledCups = total / WATER_CUP_ML;
  const future = date > today;
  const customMl = parseDecimal(custom);
  const customError = customMl === null ? null : waterInputError(customMl);

  function add(ml: number) {
    addWater.mutate(
      // Registros de hoje levam o horário; lançamentos para outro dia ficam sem.
      { date, ml, time: date === today ? nowTime() : undefined },
      {
        onSuccess: () => toast.success(`+${formatNumber(ml, 0)} ml de água`),
        onError: (e) => toast.error(e.message || "Não foi possível registrar a água."),
      },
    );
  }

  function remove(id: string, ml: number) {
    removeWater.mutate(id, {
      onSuccess: () => toast.success(`${formatNumber(ml, 0)} ml removidos`),
      onError: () => toast.error("Não foi possível remover o registro."),
    });
  }

  if (water.isPending || goals.isPending) return <Skeleton className="h-72 lg:col-span-2" />;

  return (
    <section className="overflow-hidden surface lg:col-span-2" aria-labelledby="agua-titulo">
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-6">
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-water-soft text-water-strong">
                <Droplet className="h-5 w-5 fill-current" />
              </span>
              <div className="min-w-0">
                <h2 id="agua-titulo" className="truncate text-xl font-bold">
                  Água
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  {entries.length === 0
                    ? "Sem registros neste dia"
                    : `${entries.length} ${entries.length === 1 ? "registro" : "registros"} em ${formatDate(date)}`}
                </p>
              </div>
            </div>
            {p && entries.length > 0 && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold tabular",
                  p.over ? "bg-water text-ink" : "bg-water-soft text-water-strong",
                )}
              >
                {formatNumber(p.pct, 0)}%
              </span>
            )}
          </div>

          <p className="tabular">
            <span className="font-display text-5xl font-bold">{entries.length ? liters(total) : "—"}</span>
            <span className="ml-2 text-muted-foreground">{goal ? `de ${liters(goal)}` : "consumidos"}</span>
          </p>

          {goal && p ? (
            <>
              {/* Copos: o preenchimento não depende só de cor (cheio × contorno). */}
              <div
                className="flex gap-1 sm:gap-1.5"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(p.fill)}
                aria-label={`Água: ${formatNumber(total, 0)} ml de ${formatNumber(goal, 0)} ml, ${formatNumber(p.pct, 0)}% da meta`}
              >
                {Array.from({ length: cups }, (_, i) => {
                  const fill = Math.max(0, Math.min(1, filledCups - i));
                  return (
                    <span
                      key={i}
                      className="relative h-9 max-w-7 flex-1 overflow-hidden rounded-t-sm rounded-b-lg border-2 border-water/60 bg-water-soft"
                      aria-hidden
                    >
                      <span
                        className="absolute inset-x-0 bottom-0 bg-water transition-all duration-500"
                        style={{ height: `${fill * 100}%` }}
                      />
                    </span>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                {entries.length === 0
                  ? `Meta do dia: ${formatNumber(goal, 0)} ml · cada copo representa ${WATER_CUP_ML} ml.`
                  : p.over
                    ? `${formatNumber(p.diff, 0)} ml acima da meta do dia.`
                    : `Faltam ${formatNumber(p.diff, 0)} ml · cada copo representa ${WATER_CUP_ML} ml.`}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed p-3 text-sm">
              <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 text-muted-foreground">Sem meta de água nesta data.</span>
              <Link to="/metas" className="font-semibold text-primary-strong hover:underline">
                Configurar
              </Link>
            </div>
          )}

          {future ? (
            <p className="text-sm text-muted-foreground">Não é possível registrar água em datas futuras.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {WATER_QUICK_ML.map((ml) => {
                const Icon = QUICK_ICON[ml];
                return (
                  <Button
                    key={ml}
                    variant="water"
                    disabled={addWater.isPending}
                    className="px-3 sm:px-5"
                    aria-label={`Adicionar ${QUICK_LABEL[ml].toLowerCase()} de ${ml} ml`}
                    onClick={() => add(ml)}
                  >
                    <Icon /> <span className="hidden sm:inline">{QUICK_LABEL[ml]} ·</span> {ml} ml
                  </Button>
                );
              })}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-3 sm:px-5">
                    <Plus /> Outro<span className="hidden sm:inline"> valor</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 rounded-2xl" align="start">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customMl === null || customError || addWater.isPending) return;
                      add(customMl);
                      setCustom("");
                      setOpen(false);
                    }}
                  >
                    <label htmlFor="agua-ml" className="text-sm font-medium">
                      Quantidade (ml)
                    </label>
                    <Input
                      id="agua-ml"
                      inputMode="decimal"
                      autoFocus
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="Ex.: 350"
                      aria-invalid={!!customError}
                      className="h-10 rounded-xl"
                    />
                    {customError && <p className="text-xs font-medium text-destructive">{customError}</p>}
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full"
                      disabled={customMl === null || !!customError || addWater.isPending}
                    >
                      Adicionar
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl bg-muted/60 p-4">
          <h3 className="mb-2 text-sm font-bold">Registros do dia</h3>
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum registro de água. Isso não significa que você não bebeu água.
            </p>
          ) : (
            <ul className="max-h-56 divide-y overflow-y-auto">
              {sortWaterEntries(entries).map((e) => (
                <li key={e.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2">
                  <Droplet className="h-4 w-4 fill-water text-water" aria-hidden />
                  <span className="text-sm tabular">
                    <span className="font-semibold">{formatNumber(e.ml, 0)} ml</span>
                    <span className="ml-2 text-muted-foreground">{e.time ?? "—"}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={removeWater.isPending}
                    aria-label={`Remover ${formatNumber(e.ml, 0)} ml${e.time ? ` das ${e.time}` : ""}`}
                    onClick={() => remove(e.id, e.ml)}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
