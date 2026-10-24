import { ArrowLeft, Clock, Plus, Search, Star } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { NutrientPreview } from "@/components/nutrition/nutrient-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SHEET_ON_MOBILE } from "@/components/ui/dialog-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { portionToAmount } from "@/domain/nutrition/calculations";
import { fromPer100, matchesFoodQuery } from "@/domain/nutrition/foods";
import { DEFAULT_MEAL_NAMES, suggestMealName } from "@/domain/nutrition/meals";
import type { Food, ISODate } from "@/domain/nutrition/types";
import { useFoods, useRecentFoods } from "@/features/foods/api";
import { FoodForm } from "@/features/foods/components/food-form";
import { useAddMealItem } from "@/features/meals/api";
import { formatDate } from "@/lib/dates";
import { formatNumber, formatNutrient, parseDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tab = "recentes" | "favoritos" | "todos";

/** Passo do diálogo: buscar, cadastrar um alimento novo ou informar a quantidade. */
type Step = { kind: "search" } | { kind: "create"; name: string } | { kind: "quantity"; food: Food };

/** Unidade escolhida: a base do alimento (g/ml) ou o id de uma porção. */
type Unit = { kind: "base" } | { kind: "portion"; id: string };

export function AddFoodDialog({
  children,
  date,
  defaultMeal,
}: {
  children: ReactNode;
  date: ISODate;
  defaultMeal?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ kind: "search" });
  const toSearch = () => setStep({ kind: "search" });

  function onOpenChange(next: boolean) {
    setOpen(next);
    // Zera ao abrir (e não ao fechar) para o conteúdo não trocar durante a animação de saída.
    if (next) toSearch();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn(SHEET_ON_MOBILE, step.kind === "create" && "max-w-2xl")}>
        {step.kind === "quantity" ? (
          <QuantityStep
            food={step.food}
            date={date}
            defaultMeal={defaultMeal}
            onBack={toSearch}
            onDone={() => onOpenChange(false)}
          />
        ) : step.kind === "create" ? (
          <>
            <DialogHeader>
              <BackButton onClick={toSearch} />
              <DialogTitle className="font-display text-2xl">Novo alimento</DialogTitle>
              <DialogDescription>
                Depois de salvar, você volta para informar a quantidade. Campos vazios ficam como “não
                informado”.
              </DialogDescription>
            </DialogHeader>
            {/* O cadastro entra na biblioteca e segue direto para a quantidade, sem perder a refeição. */}
            <FoodForm
              initial={{ name: step.name }}
              onSaved={(food) => setStep({ kind: "quantity", food })}
              onCancel={toSearch}
            />
          </>
        ) : (
          <SearchStep
            onPick={(food) => setStep({ kind: "quantity", food })}
            onCreate={(name) => setStep({ kind: "create", name })}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Calorias na quantidade de referência do alimento. */
function kcalAtBase(food: Food) {
  const kcal = fromPer100(food.per100, food.baseAmount).kcal;
  return kcal == null ? "—" : formatNutrient("kcal", kcal);
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Voltar à busca
    </button>
  );
}

function SearchStep({
  onPick,
  onCreate,
}: {
  onPick: (food: Food) => void;
  onCreate: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("recentes");
  const foods = useFoods();
  const recent = useRecentFoods();

  const list = useMemo(() => {
    const active = (foods.data ?? []).filter((f) => !f.archived);
    if (query.trim()) return active.filter((f) => matchesFoodQuery(f, query));
    if (tab === "recentes") return recent.data ?? [];
    if (tab === "favoritos") return active.filter((f) => f.favorite);
    return active;
  }, [foods.data, recent.data, query, tab]);

  const loading = foods.isPending || (tab === "recentes" && !query && recent.isPending);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Registrar alimento</DialogTitle>
        <DialogDescription>Busque na sua biblioteca pessoal.</DialogDescription>
      </DialogHeader>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou marca"
          aria-label="Buscar alimento"
          className="h-11 rounded-full pl-10"
        />
      </div>
      {!query && (
        <div className="flex gap-2" role="tablist" aria-label="Lista de alimentos">
          {(["recentes", "favoritos", "todos"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "bg-ink text-ink-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "recentes" && <Clock className="h-3.5 w-3.5" />}
              {t === "favoritos" && <Star className="h-3.5 w-3.5" />}
              {t}
            </button>
          ))}
        </div>
      )}
      <ul className="-mx-2 max-h-80 space-y-1 overflow-y-auto" aria-busy={loading}>
        {loading &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="px-3 py-1">
              <Skeleton className="h-11" />
            </li>
          ))}
        {!loading &&
          list.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => onPick(f)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{f.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {f.brand ? `${f.brand} · ` : ""}por {formatNumber(f.baseAmount)} {f.base}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular">{kcalAtBase(f)}</span>
              </button>
            </li>
          ))}
        {!loading && list.length === 0 && (
          <li className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            {query
              ? `Nenhum alimento encontrado para “${query}”.`
              : tab === "favoritos"
                ? "Você ainda não marcou favoritos."
                : "Nenhum alimento por aqui ainda."}
          </li>
        )}
      </ul>
      <Button variant="outline" onClick={() => onCreate(query.trim())}>
        <Plus /> {query.trim() ? `Cadastrar “${query.trim()}”` : "Cadastrar novo alimento"}
      </Button>
    </>
  );
}

function QuantityStep({
  food,
  date,
  defaultMeal,
  onBack,
  onDone,
}: {
  food: Food;
  date: ISODate;
  defaultMeal?: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const firstPortion = food.portions[0];
  // Sem porção, sugere a quantidade de referência do cadastro (ex.: 35 g).
  const [qty, setQty] = useState(firstPortion ? "1" : formatNumber(food.baseAmount, 3));
  const [unit, setUnit] = useState<Unit>(
    firstPortion ? { kind: "portion", id: firstPortion.id } : { kind: "base" },
  );
  // Sem refeição definida, sugere pela hora em que o diálogo abriu.
  const [meal, setMeal] = useState(() => defaultMeal ?? suggestMealName(new Date().getHours()));
  const addItem = useAddMealItem();

  const portion = unit.kind === "portion" ? food.portions.find((p) => p.id === unit.id) : undefined;
  const count = parseDecimal(qty);
  const valid = count !== null && Number.isFinite(count) && count > 0;
  const amount = valid ? (portion ? portionToAmount(portion, count) : count) : 0;
  // Mantém um nome personalizado (vindo do card da refeição) entre as opções.
  const mealOptions: string[] = [...DEFAULT_MEAL_NAMES];
  if (!mealOptions.includes(meal)) mealOptions.push(meal);

  function submit() {
    if (!valid || addItem.isPending) return;
    addItem.mutate(
      {
        date,
        mealName: meal,
        foodId: food.id,
        amount,
        portion: portion && { name: portion.name, count, amount: portion.amount },
      },
      {
        onSuccess: () => {
          toast.success(`${food.name} adicionado em ${meal}`, { description: formatDate(date) });
          onDone();
        },
        onError: () => toast.error("Não foi possível registrar o alimento. Tente novamente."),
      },
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <DialogHeader>
        <BackButton onClick={onBack} />
        <DialogTitle className="font-display text-2xl">{food.name}</DialogTitle>
        <DialogDescription>
          {food.brand ? `${food.brand} · ` : ""}Valores por {formatNumber(food.baseAmount)} {food.base}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="qtd">Quantidade</Label>
          <Input
            id="qtd"
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            aria-invalid={!valid}
            aria-describedby="qtd-erro"
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unidade">Unidade</Label>
          <Select
            value={unit.kind === "base" ? "base" : unit.id}
            onValueChange={(v) => setUnit(v === "base" ? { kind: "base" } : { kind: "portion", id: v })}
          >
            <SelectTrigger id="unidade" className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">{food.base}</SelectItem>
              {food.portions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({formatNumber(p.amount)} {food.base})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!valid && (
          <p id="qtd-erro" className="col-span-2 -mt-1 text-xs font-medium text-destructive">
            Informe uma quantidade maior que zero.
          </p>
        )}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="refeicao">Refeição</Label>
          <Select value={meal} onValueChange={setMeal}>
            <SelectTrigger id="refeicao" className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mealOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <NutrientPreview per100={food.per100} base={food.base} amount={valid ? amount : null} />

      <Button type="submit" size="lg" disabled={!valid || addItem.isPending}>
        {addItem.isPending ? "Adicionando…" : "Adicionar à refeição"}
      </Button>
    </form>
  );
}
