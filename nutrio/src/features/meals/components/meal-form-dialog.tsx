import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHEET_ON_MOBILE } from "@/components/ui/dialog-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_MEAL_NAMES } from "@/domain/nutrition/meals";
import type { ISODate, Meal } from "@/domain/nutrition/types";
import { useCreateMeal, useUpdateMeal } from "@/features/meals/api";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useDialogSession } from "@/lib/use-dialog-session";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome da refeição.").max(60, "Use até 60 caracteres."),
  time: z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido.")]),
  notes: z.string().max(500, "Use até 500 caracteres."),
});

type FormValues = z.infer<typeof schema>;

/** Cria uma refeição na data ou edita a refeição informada. */
export function MealFormDialog({
  open,
  onOpenChange,
  date,
  meal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: ISODate;
  meal?: Meal;
}) {
  const session = useDialogSession(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={SHEET_ON_MOBILE}>
        <MealForm key={session} date={date} meal={meal} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function MealForm({ date, meal, onDone }: { date: ISODate; meal?: Meal; onDone: () => void }) {
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal();
  const pending = createMeal.isPending || updateMeal.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: meal?.name ?? "", time: meal?.time ?? "", notes: meal?.notes ?? "" },
  });
  const { errors } = form.formState;
  const name = useWatch({ control: form.control, name: "name" });

  function onSubmit(values: FormValues) {
    const callbacks = {
      onSuccess: () => {
        toast.success(meal ? "Refeição atualizada" : `${values.name.trim()} criado em ${formatDate(date)}`);
        onDone();
      },
      onError: () => toast.error("Não foi possível salvar a refeição. Tente novamente."),
    };
    if (meal) updateMeal.mutate({ mealId: meal.id, ...values }, callbacks);
    else createMeal.mutate({ date, ...values }, callbacks);
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {meal ? "Editar refeição" : "Nova refeição"}
        </DialogTitle>
        <DialogDescription>{formatDate(meal?.date ?? date)}</DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="meal-name">Nome</Label>
        <Input
          id="meal-name"
          autoFocus
          autoComplete="off"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "meal-name-erro" : undefined}
          className="h-11 rounded-xl"
          {...form.register("name")}
        />
        {errors.name && (
          <p id="meal-name-erro" className="text-xs font-medium text-destructive">
            {errors.name.message}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Sugestões de nome">
          {DEFAULT_MEAL_NAMES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => form.setValue("name", s, { shouldValidate: true })}
              aria-pressed={name === s}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                name === s ? "border-primary bg-primary-soft" : "hover:border-primary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meal-time">
          Horário <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="meal-time"
          type="time"
          aria-invalid={!!errors.time}
          className="h-11 w-36 rounded-xl"
          {...form.register("time")}
        />
        {errors.time && <p className="text-xs font-medium text-destructive">{errors.time.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meal-notes">
          Observações <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea id="meal-notes" rows={3} className="rounded-xl" {...form.register("notes")} />
        {errors.notes && <p className="text-xs font-medium text-destructive">{errors.notes.message}</p>}
      </div>

      <DialogFooter>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando…" : meal ? "Salvar alterações" : "Criar refeição"}
        </Button>
      </DialogFooter>
    </form>
  );
}
