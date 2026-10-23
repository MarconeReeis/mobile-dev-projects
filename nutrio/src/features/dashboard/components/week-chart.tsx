import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { dayTotals, goalsFor } from "@/domain/nutrition/calculations";
import { NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { ISODate } from "@/domain/nutrition/types";
import { useGoalVersions } from "@/features/goals/api";
import { useMealsRange } from "@/features/meals/api";
import { addDays, formatDate, weekdayShort } from "@/lib/dates";
import { formatNumber, formatNutrient } from "@/lib/format";
import { cn } from "@/lib/utils";

const METRICS: { key: NutrientKey; label: string; bar: string }[] = [
  { key: "kcal", label: "Calorias", bar: "bg-primary" },
  { key: "protein", label: "Proteínas", bar: "bg-protein" },
  { key: "carbs", label: "Carboidratos", bar: "bg-carbs" },
  { key: "fat", label: "Gorduras", bar: "bg-fat" },
];

export function WeekChart({ endDate, selected }: { endDate: ISODate; selected: ISODate }) {
  const [metric, setMetric] = useState<NutrientKey>("kcal");
  const start = addDays(endDate, -6);
  const meals = useMealsRange(start, endDate);
  const goals = useGoalVersions();
  const m = METRICS.find((x) => x.key === metric) ?? METRICS[0]!;

  return (
    <section className="surface p-5 lg:p-6" aria-labelledby="semana-titulo">
      <h2 id="semana-titulo" className="text-xl font-bold">
        Últimos 7 dias
      </h2>
      {meals.isPending || goals.isPending ? (
        <div className="mt-4 space-y-4" aria-busy>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-60" />
        </div>
      ) : meals.isError || goals.isError ? (
        <p className="mt-2 text-sm text-muted-foreground">Não foi possível carregar o histórico da semana.</p>
      ) : (
        <Chart
          days={Array.from({ length: 7 }, (_, i) => {
            const date = addDays(start, i);
            const dayMeals = meals.data.filter((x) => x.date === date);
            const totals = dayTotals(dayMeals);
            return {
              date,
              // Dia sem itens é "sem registros", nunca zero.
              total: totals[metric].hasData ? totals[metric].value : null,
              goal: goalsFor(goals.data, date)?.goals[metric]?.value,
            };
          })}
          goalNow={goalsFor(goals.data, endDate)?.goals[metric]?.value}
          metric={m}
          selected={selected}
          onMetricChange={setMetric}
        />
      )}
    </section>
  );
}

type Day = { date: ISODate; total: number | null; goal: number | undefined };

function Chart({
  days,
  goalNow,
  metric: m,
  selected,
  onMetricChange,
}: {
  days: Day[];
  goalNow: number | undefined;
  metric: (typeof METRICS)[number];
  selected: ISODate;
  onMetricChange: (key: NutrientKey) => void;
}) {
  const metric = m.key;
  const max = Math.max(...days.map((d) => Math.max(d.total ?? 0, d.goal ?? 0))) * 1.1 || 1;
  const withData = days.filter((d) => d.total !== null);
  const avg = withData.reduce((s, d) => s + (d.total ?? 0), 0) / (withData.length || 1);

  return (
    <>
      <p className="text-sm text-muted-foreground tabular">
        {withData.length > 0
          ? `Média de ${formatNutrient(metric, avg)} em ${withData.length} ${withData.length === 1 ? "dia" : "dias"} com registro`
          : "Nenhum registro nesta semana"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Nutriente do gráfico">
        {METRICS.map((x) => (
          <button
            key={x.key}
            role="radio"
            aria-checked={metric === x.key}
            onClick={() => onMetricChange(x.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              metric === x.key
                ? "bg-ink text-ink-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", x.bar)} aria-hidden />
            {x.label}
          </button>
        ))}
      </div>

      <div className="relative mt-6 h-52" aria-hidden>
        {goalNow && (
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-foreground/25"
            style={{ bottom: `${(goalNow / max) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 rounded-full bg-card px-1.5 text-[11px] font-medium text-muted-foreground tabular">
              meta {formatNutrient(metric, goalNow)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 grid grid-cols-7 items-end gap-2 sm:gap-4">
          {days.map((d) => {
            const pct = d.goal && d.total !== null ? Math.round((d.total / d.goal) * 100) : null;
            const isSelected = d.date === selected;
            return (
              <div key={d.date} className="flex h-full flex-col items-center justify-end gap-1.5">
                {d.total !== null ? (
                  <>
                    <span
                      className={cn(
                        "text-[11px] font-semibold tabular",
                        isSelected ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {pct !== null ? `${pct}%` : formatNumber(d.total, 0)}
                    </span>
                    <div
                      className={cn(
                        "w-full max-w-10 rounded-xl transition-all duration-500",
                        m.bar,
                        !isSelected && "opacity-45",
                      )}
                      style={{ height: `${(d.total / max) * 100}%` }}
                    />
                  </>
                ) : (
                  <>
                    <span className="text-center text-[10px] leading-tight text-muted-foreground">
                      sem registros
                    </span>
                    <div className="h-1/3 w-full max-w-10 rounded-xl border border-dashed stripes" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-center sm:gap-4" aria-hidden>
        {days.map((d) => (
          <span
            key={d.date}
            className={cn("text-xs", d.date === selected ? "font-bold" : "text-muted-foreground")}
          >
            {weekdayShort(d.date)}
          </span>
        ))}
      </div>

      {/* Alternativa textual acessível */}
      <table className="sr-only">
        <caption>{NUTRIENTS[metric].label} nos últimos 7 dias</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Consumo</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{formatDate(d.date)}</td>
              <td>{d.total !== null ? formatNutrient(metric, d.total) : "sem registros"}</td>
              <td>{d.goal ? formatNutrient(metric, d.goal) : "sem meta"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
