import { useState } from "react";
import { toast } from "sonner";

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
import type { ISODate, Meal } from "@/domain/nutrition/types";
import { useDuplicateMeal } from "@/features/meals/api";
import { useToday } from "@/features/profile/api";
import { addDays, formatDate } from "@/lib/dates";
import { useDialogSession } from "@/lib/use-dialog-session";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Sugestão de destino: hoje, ou amanhã se a refeição já é de hoje. */
const suggestedTarget = (from: ISODate, today: ISODate) => (from === today ? addDays(from, 1) : today);

export function DuplicateMealDialog({
  open,
  onOpenChange,
  meal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal;
}) {
  const session = useDialogSession(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={SHEET_ON_MOBILE}>
        <DuplicateForm key={session} meal={meal} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DuplicateForm({ meal, onDone }: { meal: Meal; onDone: () => void }) {
  const today = useToday();
  const [target, setTarget] = useState(() => suggestedTarget(meal.date, today));
  const duplicate = useDuplicateMeal();
  const valid = ISO_DATE.test(target);

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || duplicate.isPending) return;
        duplicate.mutate(
          { mealId: meal.id, targetDate: target },
          {
            onSuccess: () => {
              toast.success(`${meal.name} duplicado para ${formatDate(target)}`);
              onDone();
            },
            onError: () => toast.error("Não foi possível duplicar a refeição."),
          },
        );
      }}
    >
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Duplicar {meal.name}</DialogTitle>
        <DialogDescription>
          Cria uma cópia com{" "}
          {meal.items.length === 1 ? "o alimento registrado" : `os ${meal.items.length} alimentos`} e as
          mesmas quantidades. A refeição de {formatDate(meal.date)} não muda.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor="dup-date">Data de destino</Label>
        <Input
          id="dup-date"
          type="date"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          aria-invalid={!valid}
          className="h-11 w-48 rounded-xl"
        />
        {!valid && <p className="text-xs font-medium text-destructive">Escolha uma data.</p>}
      </div>
      <DialogFooter>
        <Button type="submit" size="lg" disabled={!valid || duplicate.isPending} className="w-full sm:w-auto">
          {duplicate.isPending ? "Duplicando…" : "Duplicar refeição"}
        </Button>
      </DialogFooter>
    </form>
  );
}
