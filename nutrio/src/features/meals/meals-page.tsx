import { CalendarX2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { PartialTag } from "@/components/nutrition/partial-tag";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dayTotals } from "@/domain/nutrition/calculations";
import { DEFAULT_MEAL_NAMES } from "@/domain/nutrition/meals";
import type { ISODate, Meal } from "@/domain/nutrition/types";
import { DateStrip } from "@/features/dashboard/components/date-strip";
import { useCreateMeal, useMealsOn } from "@/features/meals/api";
import { MealCard } from "@/features/meals/components/meal-card";
import { MealFormDialog } from "@/features/meals/components/meal-form-dialog";
import { formatDate, weekdayLong } from "@/lib/dates";
import { formatNumber, formatNutrient } from "@/lib/format";

export function MealsPage({
  date,
  today,
  onDateChange,
}: {
  date: ISODate;
  today: ISODate;
  onDateChange: (date: ISODate) => void;
}) {
  const meals = useMealsOn(date);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow={`${weekdayLong(date)}, ${formatDate(date)}`}
        title="Refeições"
        action={
          <Button variant="ink" onClick={() => setCreating(true)} aria-label="Nova refeição">
            <Plus /> <span className="hidden sm:inline">Nova refeição</span>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <DateStrip value={date} today={today} onChange={onDateChange} />

          {meals.isPending ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : meals.isError ? (
            <section className="flex flex-col items-center gap-3 surface px-6 py-12 text-center" role="alert">
              <h2 className="text-xl font-bold">Não foi possível carregar as refeições</h2>
              <Button variant="outline" onClick={() => void meals.refetch()}>
                Tentar novamente
              </Button>
            </section>
          ) : meals.data.length === 0 ? (
            <section className="flex flex-col items-center gap-3 surface px-6 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted">
                <CalendarX2 className="h-6 w-6 text-muted-foreground" />
              </span>
              <h2 className="text-xl font-bold">Nenhuma refeição neste dia</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Comece por uma das sugestões ou crie uma refeição com o nome que preferir.
              </p>
              <Button className="mt-2" onClick={() => setCreating(true)}>
                <Plus /> Nova refeição
              </Button>
            </section>
          ) : (
            meals.data.map((m, i, all) => (
              <MealCard key={m.id} meal={m} position={{ first: i === 0, last: i === all.length - 1 }} />
            ))
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-10 lg:self-start">
          <DayTotalCard meals={meals.data} />
          <Suggestions date={date} />
        </aside>
      </div>

      <MealFormDialog open={creating} onOpenChange={setCreating} date={date} />
    </>
  );
}

function DayTotalCard({ meals }: { meals: Meal[] | undefined }) {
  const totals = meals ? dayTotals(meals) : null;
  const show = (key: "kcal" | "protein" | "carbs" | "fat") => (totals?.[key].hasData ? totals[key] : null);
  const kcal = show("kcal");

  return (
    <section className="surface bg-ink p-5 text-ink-foreground" aria-labelledby="total-dia">
      <h2 id="total-dia" className="text-xs font-semibold tracking-widest uppercase opacity-70">
        Total do dia
      </h2>
      <p className="mt-2 font-display text-4xl font-bold tabular">
        {kcal ? formatNutrient("kcal", kcal.value) : "—"}
      </p>
      {!kcal && <p className="text-sm opacity-70">Sem registros</p>}
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm tabular">
        {(
          [
            ["protein", "Proteínas"],
            ["carbs", "Carbos"],
            ["fat", "Gorduras"],
          ] as const
        ).map(([key, label]) => {
          const t = show(key);
          return (
            <div key={key} className="rounded-xl bg-ink-foreground/10 px-2.5 py-2">
              <dt className="text-xs opacity-70">{label}</dt>
              <dd className="font-semibold">{t ? `${formatNumber(t.value)} g` : "—"}</dd>
            </div>
          );
        })}
      </dl>
      {totals && (["kcal", "protein", "carbs", "fat"] as const).some((k) => totals[k].partial) && (
        <p className="mt-3 flex items-center gap-2 text-xs opacity-80 [&>span]:border-ink-foreground/50 [&>span]:text-ink-foreground">
          <PartialTag /> Algum alimento sem informação completa.
        </p>
      )}
    </section>
  );
}

function Suggestions({ date }: { date: ISODate }) {
  const createMeal = useCreateMeal();

  return (
    <section className="surface p-5" aria-labelledby="sugestoes">
      <h2 id="sugestoes" className="text-lg font-bold">
        Sugestões
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">Você pode repetir nomes e mudar a ordem.</p>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_MEAL_NAMES.map((name) => (
          <button
            key={name}
            disabled={createMeal.isPending}
            onClick={() =>
              createMeal.mutate(
                { date, name },
                {
                  onSuccess: () => toast.success(`${name} criado em ${formatDate(date)}`),
                  onError: () => toast.error("Não foi possível criar a refeição."),
                },
              )
            }
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary-soft disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> {name}
          </button>
        ))}
      </div>
    </section>
  );
}
