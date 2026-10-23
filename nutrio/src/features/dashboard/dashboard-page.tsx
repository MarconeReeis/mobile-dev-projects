import { Link } from "@tanstack/react-router";
import { CalendarX2, Plus, Target } from "lucide-react";
import { useState } from "react";

import { CalorieRing } from "@/components/nutrition/calorie-ring";
import { NutrientBar } from "@/components/nutrition/nutrient-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dayTotals } from "@/domain/nutrition/calculations";
import { MACRO_KEYS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { GoalVersion, ISODate, Meal, Totals } from "@/domain/nutrition/types";
import { firstName } from "@/domain/profile/types";
import { useGoalsOn } from "@/features/goals/api";
import { useMealsOn } from "@/features/meals/api";
import { AddFoodDialog } from "@/features/meals/components/add-food-dialog";
import { MealCard } from "@/features/meals/components/meal-card";
import { useProfile } from "@/features/profile/api";
import { formatDate, weekdayLong } from "@/lib/dates";
import { formatNutrient } from "@/lib/format";

import { DateStrip } from "./components/date-strip";
import { WeekChart } from "./components/week-chart";

const OTHER_KEYS: NutrientKey[] = ["sodium", "satFat", "sugar", "calcium", "iron", "potassium", "vitC"];

function greeting(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardPage({
  date,
  today,
  onDateChange,
}: {
  date: ISODate;
  today: ISODate;
  onDateChange: (date: ISODate) => void;
}) {
  const profile = useProfile();
  const meals = useMealsOn(date);
  const goals = useGoalsOn(date);

  const [hour] = useState(() => new Date().getHours());
  const name = profile.data ? firstName(profile.data) : "";

  return (
    <>
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {weekdayLong(date)}, {formatDate(date)}
          </p>
          <h1 className="truncate text-3xl font-bold lg:text-4xl">
            {greeting(hour)}
            {name && `, ${name}`}
          </h1>
        </div>
        <AddFoodDialog date={date}>
          <Button size="lg" className="hidden sm:inline-flex">
            <Plus /> Registrar alimento
          </Button>
        </AddFoodDialog>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="lg:col-span-2">
          <DateStrip value={date} today={today} onChange={onDateChange} />
        </div>

        {meals.isPending || goals.isPending ? (
          <DaySkeleton />
        ) : meals.isError || goals.isError ? (
          <LoadError onRetry={() => void Promise.all([meals.refetch(), goals.refetch()])} />
        ) : (
          <DayContent date={date} meals={meals.data} goals={goals.data} />
        )}

        <div className="lg:col-span-2">
          <WeekChart endDate={date > today ? date : today} selected={date} />
        </div>
      </div>
    </>
  );
}

function DayContent({ date, meals, goals }: { date: ISODate; meals: Meal[]; goals: GoalVersion | null }) {
  const totals = dayTotals(meals);
  const hasItems = meals.some((m) => m.items.length > 0);
  const g = goals?.goals ?? {};

  return (
    <>
      <CaloriesCard totals={totals} hasItems={hasItems} goals={goals} />

      <section className="grid grid-cols-2 gap-3" aria-label="Macronutrientes">
        {MACRO_KEYS.map((k) => (
          <div key={k} className="surface p-4">
            <NutrientBar nutrient={k} total={totals[k]} goal={g[k]} compact />
          </div>
        ))}
      </section>

      {meals.length === 0 ? (
        <section className="flex flex-col items-center gap-3 surface px-6 py-12 text-center lg:col-span-2">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted">
            <CalendarX2 className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="text-xl font-bold">Sem registros neste dia</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Nenhum alimento foi registrado em {formatDate(date)}. Isso não significa que o consumo foi zero.
          </p>
          <AddFoodDialog date={date}>
            <Button className="mt-2">
              <Plus /> Registrar alimento
            </Button>
          </AddFoodDialog>
        </section>
      ) : (
        <>
          <section className="space-y-4" aria-labelledby="refeicoes-titulo">
            <div className="flex items-center justify-between">
              <h2 id="refeicoes-titulo" className="text-2xl font-bold">
                Refeições do dia
              </h2>
              <Link
                to="/refeicoes"
                search={{ data: date }}
                className="text-sm font-semibold text-primary-strong hover:underline"
              >
                Ver todas
              </Link>
            </div>
            {meals.map((m) => (
              <MealCard key={m.id} meal={m} />
            ))}
          </section>

          <section className="@container self-start surface p-5 lg:p-6" aria-labelledby="outros-titulo">
            <h2 id="outros-titulo" className="text-xl font-bold">
              Outros nutrientes
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Nutrientes sem meta aparecem só com o consumo.
            </p>
            <div className="grid gap-5 @md:grid-cols-2">
              {OTHER_KEYS.map((k) => (
                <NutrientBar key={k} nutrient={k} total={totals[k]} goal={g[k]} compact />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

function CaloriesCard({
  totals,
  hasItems,
  goals,
}: {
  totals: Totals;
  hasItems: boolean;
  goals: GoalVersion | null;
}) {
  const goal = goals?.goals.kcal;
  const kcal = totals.kcal;

  return (
    // Container query: o card fica numa coluna estreita no desktop, então o layout
    // lado a lado depende da largura do card, não da tela.
    <section className="@container surface p-6" aria-labelledby="cal-titulo">
      <div className="grid grid-cols-1 items-center gap-6 @lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 space-y-4">
          <h2
            id="cal-titulo"
            className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          >
            Calorias
          </h2>
          <p className="tabular">
            <span className="font-display text-6xl font-bold">
              {kcal.hasData ? formatNutrient("kcal", kcal.value, false) : "—"}
            </span>
            <span className="ml-2 text-lg text-muted-foreground">kcal</span>
          </p>
          {goal ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-muted px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">Meta</dt>
                <dd className="font-semibold tabular">{formatNutrient("kcal", goal.value)}</dd>
              </div>
              <div className="rounded-2xl bg-muted px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">Saldo</dt>
                <dd className="font-semibold tabular">
                  {!hasItems
                    ? "—"
                    : kcal.value > goal.value
                      ? `${formatNutrient("kcal", kcal.value - goal.value)} acima`
                      : `${formatNutrient("kcal", goal.value - kcal.value)} restantes`}
                </dd>
              </div>
            </dl>
          ) : (
            <NoGoal />
          )}
        </div>
        <div className="justify-self-center">
          <CalorieRing consumed={kcal.value} hasData={kcal.hasData} goal={goal} />
        </div>
      </div>
    </section>
  );
}

function NoGoal() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed p-3 text-sm">
      <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 text-muted-foreground">Sem meta vigente nesta data.</span>
      <Link to="/metas" className="font-semibold text-primary-strong hover:underline">
        Configurar
      </Link>
    </div>
  );
}

function DaySkeleton() {
  return (
    <>
      <Skeleton className="h-60" />
      <div className="grid grid-cols-2 gap-3">
        {MACRO_KEYS.map((k) => (
          <Skeleton key={k} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72 lg:col-span-2" />
    </>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      className="flex flex-col items-center gap-3 surface px-6 py-12 text-center lg:col-span-2"
      role="alert"
    >
      <h2 className="text-xl font-bold">Não foi possível carregar este dia</h2>
      <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
      <Button variant="outline" onClick={onRetry}>
        Tentar novamente
      </Button>
    </section>
  );
}
