import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useFieldArray, useForm, useWatch, type FieldError, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTED_CATEGORIES } from "@/domain/nutrition/foods";
import { NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { Food } from "@/domain/nutrition/types";
import { useCreateFood, useFoods, useUpdateFood } from "@/features/foods/api";
import { formatNumber, parseDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

import { foodFormSchema, toFoodInput, toFormValues, type FoodFormValues } from "../food-form-schema";

const MACRO_FIELDS: NutrientKey[] = ["kcal", "protein", "carbs", "fat", "satFat", "transFat", "fiber"];
const OTHER_FIELDS: NutrientKey[] = ["sugar", "addedSugar", "sodium", "calcium", "iron", "potassium", "vitC"];

const LEGEND = "mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase";

/**
 * Formulário de cadastro/edição de alimento.
 * Sem `food` cria um novo; `initial` pré-preenche um cadastro novo (ex.: nome vindo da busca).
 */
export function FoodForm({
  food,
  initial,
  onSaved,
  onCancel,
}: {
  food?: Food;
  initial?: Partial<Food>;
  onSaved: (food: Food) => void;
  onCancel: () => void;
}) {
  const uid = useId();
  const createFood = useCreateFood();
  const updateFood = useUpdateFood();
  const foods = useFoods();
  const pending = createFood.isPending || updateFood.isPending;

  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: toFormValues(food ?? initial),
  });
  const { errors } = form.formState;
  const portions = useFieldArray({ control: form.control, name: "portions" });
  const base = useWatch({ control: form.control, name: "base" });
  const baseAmountText = useWatch({ control: form.control, name: "baseAmount" });
  const baseAmount = parseDecimal(baseAmountText);
  const baseLabel = baseAmount && baseAmount > 0 ? `${formatNumber(baseAmount)} ${base}` : `… ${base}`;

  const categories = [
    ...new Set([
      ...SUGGESTED_CATEGORIES,
      ...(foods.data ?? []).flatMap((f) => (f.category ? [f.category] : [])),
    ]),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  function onSubmit(values: FoodFormValues) {
    const input = toFoodInput(values);
    const callbacks = {
      onSuccess: (saved: Food) => {
        toast.success(food ? "Alimento atualizado" : `${saved.name} cadastrado`);
        onSaved(saved);
      },
      onError: () => toast.error("Não foi possível salvar o alimento. Revise os campos e tente novamente."),
    };
    if (food) updateFood.mutate({ foodId: food.id, input }, callbacks);
    else createFood.mutate(input, callbacks);
  }

  const id = (name: string) => `${uid}-${name}`;

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <fieldset className="grid gap-3">
        <legend className={LEGEND}>Informações básicas</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id={id("name")} label="Nome" required error={errors.name} className="sm:col-span-2">
            <Input
              id={id("name")}
              autoFocus
              autoComplete="off"
              placeholder="Ex.: Queijo minas frescal"
              className="h-10 rounded-xl"
              aria-invalid={!!errors.name}
              {...form.register("name")}
            />
          </Field>
          <Field id={id("brand")} label="Marca" optional error={errors.brand}>
            <Input
              id={id("brand")}
              autoComplete="off"
              className="h-10 rounded-xl"
              {...form.register("brand")}
            />
          </Field>
          <Field id={id("category")} label="Categoria" optional error={errors.category}>
            <Input
              id={id("category")}
              list={id("categories")}
              autoComplete="off"
              className="h-10 rounded-xl"
              {...form.register("category")}
            />
            <datalist id={id("categories")}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("base-amount")}>Valores nutricionais informados por</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id={id("base-amount")}
              inputMode="decimal"
              className="h-10 w-24 rounded-xl text-right tabular"
              aria-invalid={!!errors.baseAmount}
              aria-describedby={id("base-hint")}
              {...form.register("baseAmount")}
            />
            <div className="flex gap-1 rounded-full bg-muted p-1" role="radiogroup" aria-label="Unidade">
              {(["g", "ml"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={base === b}
                  onClick={() => form.setValue("base", b)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    base === b
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          {errors.baseAmount ? (
            <p className="text-xs font-medium text-destructive">{errors.baseAmount.message}</p>
          ) : (
            <p id={id("base-hint")} className="text-xs text-muted-foreground">
              Digite como está na embalagem (ex.: porção de 35 {base}). O app converte para 100 {base} nos
              cálculos.
            </p>
          )}
        </div>
      </fieldset>

      <NutrientFieldset
        legend={`Energia e macronutrientes · por ${baseLabel}`}
        keys={MACRO_FIELDS}
        form={form}
        id={id}
      />
      <NutrientFieldset
        legend={`Outros nutrientes · por ${baseLabel}`}
        keys={OTHER_FIELDS}
        form={form}
        id={id}
      />

      <fieldset className="grid gap-3">
        <legend className={LEGEND}>Porções</legend>
        <p className="-mt-2 text-sm text-muted-foreground">
          Ex.: “1 fatia” equivale a 30 {base}. Ao registrar 2 fatias, o app calcula 60 {base}.
        </p>
        {portions.fields.map((field, i) => {
          const err = errors.portions?.[i];
          return (
            <div key={field.id} className="grid grid-cols-[minmax(0,1fr)_110px_auto] items-start gap-2">
              <Field id={id(`p${i}-name`)} label="Nome da porção" error={err?.name}>
                <Input
                  id={id(`p${i}-name`)}
                  placeholder="1 fatia"
                  className="h-10 rounded-xl"
                  aria-invalid={!!err?.name}
                  {...form.register(`portions.${i}.name`)}
                />
              </Field>
              <Field id={id(`p${i}-amount`)} label={`Equivale (${base})`} error={err?.amount}>
                <Input
                  id={id(`p${i}-amount`)}
                  inputMode="decimal"
                  placeholder="30"
                  className="h-10 rounded-xl"
                  aria-invalid={!!err?.amount}
                  {...form.register(`portions.${i}.amount`)}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                aria-label={`Remover porção ${i + 1}`}
                onClick={() => portions.remove(i)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => portions.append({ name: "", amount: "" })}
        >
          <Plus /> Adicionar porção
        </Button>
      </fieldset>

      <Field id={id("notes")} label="Observações" optional error={errors.notes}>
        <Textarea id={id("notes")} rows={2} className="rounded-xl" {...form.register("notes")} />
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : food ? "Salvar alterações" : "Cadastrar alimento"}
        </Button>
      </div>
    </form>
  );
}

function NutrientFieldset({
  legend,
  keys,
  form,
  id,
}: {
  legend: string;
  keys: NutrientKey[];
  form: UseFormReturn<FoodFormValues>;
  id: (name: string) => string;
}) {
  const errors = form.formState.errors.nutrients;
  return (
    <fieldset>
      <legend className={LEGEND}>{legend}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {keys.map((k) => (
          <Field
            key={k}
            id={id(k)}
            label={`${NUTRIENTS[k].label} (${NUTRIENTS[k].unit})`}
            error={errors?.[k]}
          >
            <Input
              id={id(k)}
              inputMode="decimal"
              placeholder="não informado"
              className="h-10 rounded-xl"
              aria-invalid={!!errors?.[k]}
              {...form.register(`nutrients.${k}`)}
            />
          </Field>
        ))}
      </div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  required,
  optional,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: FieldError;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs">
        {label}
        {required && <span aria-hidden> *</span>}
        {optional && <span className="font-normal text-muted-foreground"> (opcional)</span>}
      </Label>
      {children}
      {error?.message && <p className="text-xs font-medium text-destructive">{error.message}</p>}
    </div>
  );
}
