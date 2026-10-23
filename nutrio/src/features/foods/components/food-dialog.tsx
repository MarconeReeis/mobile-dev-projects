import { Copy, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SHEET_ON_MOBILE } from "@/components/ui/dialog-sheet";
import { NUTRIENT_KEYS, NUTRIENTS } from "@/domain/nutrition/nutrients";
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

  return (
    <>
      <DialogHeader>
        <p className="text-xs font-medium text-muted-foreground">
          {food.category ?? "Sem categoria"}
          {food.archived && " · arquivado"}
        </p>
        <DialogTitle className="font-display text-2xl">{food.name}</DialogTitle>
        <DialogDescription>
          {food.brand ? `${food.brand} · ` : ""}Valores por 100 {food.base}
        </DialogDescription>
      </DialogHeader>

      <dl className="divide-y rounded-2xl border">
        {NUTRIENT_KEYS.map((k) => {
          const v = food.per100[k];
          return (
            <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-2 text-sm">
              <dt className={cn(k === "kcal" && "font-semibold")}>{NUTRIENTS[k].label}</dt>
              <dd className={cn("tabular", v == null ? "text-muted-foreground italic" : "font-semibold")}>
                {v == null ? "não informado" : formatNutrient(k, v)}
              </dd>
            </div>
          );
        })}
      </dl>
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
