import { Copy, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SHEET_ON_MOBILE } from "@/components/ui/dialog-sheet";
import { fromPer100 } from "@/domain/nutrition/foods";
import { NUTRIENT_KEYS, NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { Food } from "@/domain/nutrition/types";
import { useDuplicateFood } from "@/features/foods/api";
import { formatNumber, formatNutrient } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDialogSession } from "@/lib/use-dialog-session";

import { FoodForm } from "./food-form";

export type FoodDialogMode = "view" | "edit" | "create";

/**
 * Diálogo único para ver, editar ou cadastrar um alimento.
 * Em "view", o botão Editar troca para o formulário sem fechar o diálogo.
 */
export function FoodDialog({
  open,
  onOpenChange,
  mode,
  food,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FoodDialogMode;
  food?: Food;
}) {
  const session = useDialogSession(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SHEET_ON_MOBILE, "max-w-2xl")}>
        <Content key={session} initialMode={mode} food={food} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  initialMode,
  food,
  onClose,
}: {
  initialMode: FoodDialogMode;
  food?: Food;
  onClose: () => void;
}) {
  const [mode, setMode] = useState(initialMode);

  if (mode === "view" && food)
    return <FoodDetail food={food} onEdit={() => setMode("edit")} onDone={onClose} />;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">
          {food ? "Editar alimento" : "Novo alimento"}
        </DialogTitle>
        <DialogDescription>
          Campos vazios ficam como “não informado”. Use 0 só quando a quantidade for zero.
          {food && " Registros antigos não mudam."}
        </DialogDescription>
      </DialogHeader>
      <FoodForm
        food={food}
        onSaved={onClose}
        onCancel={() => (initialMode === "view" ? setMode("view") : onClose())}
      />
    </>
  );
}

function FoodDetail({ food, onEdit, onDone }: { food: Food; onEdit: () => void; onDone: () => void }) {
  const duplicate = useDuplicateFood();
  const missing = NUTRIENT_KEYS.filter((k) => food.per100[k] == null).length;
  const atBase = fromPer100(food.per100, food.baseAmount);
  // Com referência diferente de 100, mostra também por 100 para comparar com outros alimentos.
  const showPer100 = food.baseAmount !== 100;

  return (
    <>
      <DialogHeader>
        <p className="text-xs font-medium text-muted-foreground">
          {food.category ?? "Sem categoria"}
          {food.archived && " · arquivado"}
        </p>
        <DialogTitle className="font-display text-2xl">{food.name}</DialogTitle>
        <DialogDescription>
          {food.brand ? `${food.brand} · ` : ""}Valores por {formatNumber(food.baseAmount)} {food.base}
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-medium">
                Nutriente
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                por {formatNumber(food.baseAmount)} {food.base}
              </th>
              {showPer100 && (
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  por 100 {food.base}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {NUTRIENT_KEYS.map((k) => (
              <tr key={k}>
                <th
                  scope="row"
                  className={cn("px-4 py-2 text-left font-normal", k === "kcal" && "font-semibold")}
                >
                  {NUTRIENTS[k].label}
                </th>
                <NutrientCell nutrient={k} value={atBase[k]} strong />
                {showPer100 && <NutrientCell nutrient={k} value={food.per100[k]} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {missing > 0 && (
        <p className="-mt-2 text-xs text-muted-foreground">
          {missing} {missing === 1 ? "nutriente não informado" : "nutrientes não informados"}: os totais do
          dia aparecem como parciais quando este alimento é registrado.
        </p>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-bold">Porções</h3>
        {food.portions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {food.portions.map((p) => (
              <span key={p.id} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular">
                {p.name} = {formatNumber(p.amount)} {food.base}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma porção cadastrada. Registre em {food.base}.</p>
        )}
      </section>

      {food.notes && (
        <section className="space-y-1">
          <h3 className="text-sm font-bold">Observações</h3>
          <p className="text-sm whitespace-pre-line text-muted-foreground">{food.notes}</p>
        </section>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={duplicate.isPending}
          onClick={() =>
            duplicate.mutate(food.id, {
              onSuccess: (copy) => {
                toast.success(`${copy.name} criado`);
                onDone();
              },
              onError: () => toast.error("Não foi possível duplicar o alimento."),
            })
          }
        >
          <Copy /> Duplicar
        </Button>
        <Button onClick={onEdit}>
          <Pencil /> Editar
        </Button>
      </div>
    </>
  );
}

function NutrientCell({
  nutrient,
  value,
  strong,
}: {
  nutrient: NutrientKey;
  value: number | null | undefined;
  strong?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-2 text-right tabular",
        value == null ? "text-muted-foreground italic" : strong ? "font-semibold" : "text-muted-foreground",
      )}
    >
      {value == null ? "não informado" : formatNutrient(nutrient, value)}
    </td>
  );
}
