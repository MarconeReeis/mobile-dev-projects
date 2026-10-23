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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_MEAL_NAMES } from "@/domain/nutrition/meals";
import type { ISODate, MealItem } from "@/domain/nutrition/types";
import type { MoveTarget } from "@/data";
import { useMealsOn, useMoveMealItem } from "@/features/meals/api";
import { formatDate } from "@/lib/dates";
import { useDialogSession } from "@/lib/use-dialog-session";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Valor do select: refeição existente (`meal:<id>`) ou nova refeição (`new:<nome>`). */
type Choice = `meal:${string}` | `new:${string}`;

export function MoveItemDialog({
  open,
  onOpenChange,
  mealId,
  date,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  date: ISODate;
  item: MealItem;
}) {
  const session = useDialogSession(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={SHEET_ON_MOBILE}>
        <MoveForm key={session} mealId={mealId} date={date} item={item} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function MoveForm({
  mealId,
  date,
  item,
  onDone,
}: {
  mealId: string;
  date: ISODate;
  item: MealItem;
  onDone: () => void;
}) {
  const [target, setTarget] = useState(date);
  const [choice, setChoice] = useState<Choice | "">("");
  const validDate = ISO_DATE.test(target);
  // Com data inválida, consulta a data de origem só para manter o hook estável.
  const meals = useMealsOn(validDate ? target : date);
  const move = useMoveMealItem();

  const existing = (meals.data ?? []).filter((m) => m.id !== mealId);
  const valid = validDate && choice !== "";

  function toTarget(value: Choice): MoveTarget {
    return value.startsWith("meal:")
      ? { mealId: value.slice("meal:".length) }
      : { date: target, mealName: value.slice("new:".length) };
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || move.isPending) return;
        move.mutate(
          { mealId, itemId: item.id, target: toTarget(choice) },
          {
            onSuccess: (dest) => {
              toast.success(`${item.snapshot.name} movido para ${dest.name}`, {
                description: formatDate(dest.date),
              });
              onDone();
            },
            onError: () => toast.error("Não foi possível mover o alimento."),
          },
        );
      }}
    >
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Mover {item.snapshot.name}</DialogTitle>
        <DialogDescription>Escolha a data e a refeição de destino.</DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="move-date">Data</Label>
        <Input
          id="move-date"
          type="date"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setChoice("");
          }}
          aria-invalid={!validDate}
          className="h-11 w-48 rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="move-meal">Refeição</Label>
        {validDate && meals.isPending ? (
          <Skeleton className="h-11" />
        ) : (
          <Select value={choice} onValueChange={(v) => setChoice(v as Choice)} disabled={!validDate}>
            <SelectTrigger id="move-meal" className="h-11 rounded-xl">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {existing.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Refeições de {formatDate(target)}</SelectLabel>
                  {existing.map((m) => (
                    <SelectItem key={m.id} value={`meal:${m.id}`}>
                      {m.name}
                      {m.time ? ` · ${m.time}` : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              <SelectGroup>
                <SelectLabel>Criar nova refeição</SelectLabel>
                {DEFAULT_MEAL_NAMES.map((name) => (
                  <SelectItem key={name} value={`new:${name}`}>
                    Nova: {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" size="lg" disabled={!valid || move.isPending} className="w-full sm:w-auto">
          {move.isPending ? "Movendo…" : "Mover alimento"}
        </Button>
      </DialogFooter>
    </form>
  );
}
