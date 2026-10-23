import { useState } from "react";
import { toast } from "sonner";

import { NutrientPreview } from "@/components/nutrition/nutrient-preview";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { portionToAmount } from "@/domain/nutrition/calculations";
import type { MealItem } from "@/domain/nutrition/types";
import { useUpdateMealItem } from "@/features/meals/api";
import { formatNumber, parseDecimal } from "@/lib/format";
import { useDialogSession } from "@/lib/use-dialog-session";

/**
 * Edita a quantidade de um item. Usa a equivalência de porção gravada no registro,
 * não a do cadastro atual do alimento, para o histórico não mudar.
 */
export function EditItemDialog({
  open,
  onOpenChange,
  mealId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  item: MealItem;
}) {
  const session = useDialogSession(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={SHEET_ON_MOBILE}>
        <EditItemForm key={session} mealId={mealId} item={item} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditItemForm({ mealId, item, onDone }: { mealId: string; item: MealItem; onDone: () => void }) {
  const { snapshot, portion } = item;
  const [unit, setUnit] = useState<"base" | "portion">(portion ? "portion" : "base");
  const [qty, setQty] = useState(() => formatNumber(portion ? portion.count : item.amount, 2));
  const update = useUpdateMealItem();

  const count = parseDecimal(qty);
  const valid = count !== null && Number.isFinite(count) && count > 0;
  const usingPortion = unit === "portion" && portion;
  const amount = valid ? (usingPortion ? portionToAmount(portion, count) : count) : null;

  function changeUnit(next: "base" | "portion") {
    // Converte o valor digitado para a nova unidade, preservando a quantidade.
    if (valid && portion && next !== unit) {
      setQty(formatNumber(next === "base" ? portionToAmount(portion, count) : count / portion.amount, 2));
    }
    setUnit(next);
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (amount === null || update.isPending) return;
        update.mutate(
          {
            mealId,
            itemId: item.id,
            amount,
            portion: usingPortion ? { ...portion, count: count! } : undefined,
          },
          {
            onSuccess: () => {
              toast.success("Quantidade atualizada");
              onDone();
            },
            onError: () => toast.error("Não foi possível atualizar a quantidade."),
          },
        );
      }}
    >
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">{snapshot.name}</DialogTitle>
        <DialogDescription>Editar quantidade · valores por 100 {snapshot.base}</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-qtd">Quantidade</Label>
          <Input
            id="edit-qtd"
            inputMode="decimal"
            autoFocus
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            aria-invalid={!valid}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-unidade">Unidade</Label>
          {portion ? (
            <Select value={unit} onValueChange={(v) => changeUnit(v as "base" | "portion")}>
              <SelectTrigger id="edit-unidade" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">{snapshot.base}</SelectItem>
                <SelectItem value="portion">
                  {portion.name} ({formatNumber(portion.amount)} {snapshot.base})
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input id="edit-unidade" value={snapshot.base} disabled className="h-11 rounded-xl" />
          )}
        </div>
        {!valid && (
          <p className="col-span-2 -mt-1 text-xs font-medium text-destructive">
            Informe uma quantidade maior que zero.
          </p>
        )}
      </div>

      <NutrientPreview per100={snapshot.per100} base={snapshot.base} amount={amount} />

      <DialogFooter>
        <Button type="submit" size="lg" disabled={!valid || update.isPending} className="w-full sm:w-auto">
          {update.isPending ? "Salvando…" : "Salvar quantidade"}
        </Button>
      </DialogFooter>
    </form>
  );
}
