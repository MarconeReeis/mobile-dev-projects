import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MacroChips } from "@/components/nutrition/macro-chips";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { itemNutrient, mealTotals } from "@/domain/nutrition/calculations";
import type { Meal, MealItem } from "@/domain/nutrition/types";
import { useDeleteMeal, useMoveMeal, useRemoveMealItem } from "@/features/meals/api";
import { formatNumber, formatNutrient } from "@/lib/format";

import { AddFoodDialog } from "./add-food-dialog";
import { DuplicateMealDialog } from "./duplicate-meal-dialog";
import { EditItemDialog } from "./edit-item-dialog";
import { MealFormDialog } from "./meal-form-dialog";
import { MoveItemDialog } from "./move-item-dialog";

type MealDialog = "edit" | "duplicate" | "delete" | null;

/**
 * Card de uma refeição com seus itens e ações.
 * `position` habilita as ações de reordenar (posição da refeição no dia).
 */
export function MealCard({ meal, position }: { meal: Meal; position?: { first: boolean; last: boolean } }) {
  const totals = mealTotals(meal);
  const [dialog, setDialog] = useState<MealDialog>(null);
  const deleteMeal = useDeleteMeal();
  const moveMeal = useMoveMeal();

  const closeDialog = (open: boolean) => !open && setDialog(null);

  function remove() {
    deleteMeal.mutate(meal.id, {
      onSuccess: () => toast.success(`${meal.name} excluído`),
      onError: () => toast.error("Não foi possível excluir a refeição."),
    });
  }

  function reorder(direction: "up" | "down") {
    moveMeal.mutate(
      { mealId: meal.id, direction },
      { onError: () => toast.error("Não foi possível mudar a ordem.") },
    );
  }

  return (
    <article className="overflow-hidden surface" aria-labelledby={`meal-${meal.id}`}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 id={`meal-${meal.id}`} className="truncate text-lg font-bold">
              {meal.name}
            </h3>
            {meal.time && <span className="shrink-0 text-sm text-muted-foreground tabular">{meal.time}</span>}
          </div>
          {meal.items.length > 0 ? (
            <p className="mt-0.5 text-sm text-muted-foreground tabular">
              <span className="font-semibold text-foreground">
                {formatNutrient("kcal", totals.kcal.value)}
              </span>
              {" · "}P {formatNumber(totals.protein.value)}g · C {formatNumber(totals.carbs.value)}g · G{" "}
              {formatNumber(totals.fat.value)}g
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">Nenhum alimento registrado</p>
          )}
          {meal.notes && (
            <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground italic">{meal.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <AddFoodDialog date={meal.date} defaultMeal={meal.name}>
            <Button variant="secondary" size="icon" aria-label={`Adicionar alimento em ${meal.name}`}>
              <Plus />
            </Button>
          </AddFoodDialog>
          {/* modal={false}: evita o travamento de foco/ponteiro ao abrir um diálogo a partir do menu. */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Mais ações de ${meal.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onSelect={() => setDialog("edit")}>
                <Pencil className="h-4 w-4" /> Editar refeição
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDialog("duplicate")} disabled={meal.items.length === 0}>
                <Copy className="h-4 w-4" /> Duplicar para outra data
              </DropdownMenuItem>
              {position && (
                <>
                  <DropdownMenuItem
                    onSelect={() => reorder("up")}
                    disabled={position.first || moveMeal.isPending}
                  >
                    <ArrowUp className="h-4 w-4" /> Mover para cima
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => reorder("down")}
                    disabled={position.last || moveMeal.isPending}
                  >
                    <ArrowDown className="h-4 w-4" /> Mover para baixo
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                disabled={deleteMeal.isPending}
                onSelect={() => (meal.items.length > 0 ? setDialog("delete") : remove())}
              >
                <Trash2 className="h-4 w-4" /> Excluir refeição
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {meal.items.length > 0 ? (
        <ul className="divide-y">
          {meal.items.map((item) => (
            <MealItemRow key={item.id} meal={meal} item={item} />
          ))}
        </ul>
      ) : (
        <div className="px-5 py-6">
          <AddFoodDialog date={meal.date} defaultMeal={meal.name}>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
              <Plus className="h-4 w-4" /> Adicionar o primeiro alimento
            </button>
          </AddFoodDialog>
        </div>
      )}

      <MealFormDialog open={dialog === "edit"} onOpenChange={closeDialog} date={meal.date} meal={meal} />
      <DuplicateMealDialog open={dialog === "duplicate"} onOpenChange={closeDialog} meal={meal} />
      <AlertDialog open={dialog === "delete"} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {meal.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {meal.items.length === 1
                ? "O alimento registrado nesta refeição também será removido."
                : `Os ${meal.items.length} alimentos registrados nesta refeição também serão removidos.`}{" "}
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={remove}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

function MealItemRow({ meal, item }: { meal: Meal; item: MealItem }) {
  const [dialog, setDialog] = useState<"edit" | "move" | null>(null);
  const removeItem = useRemoveMealItem();
  const kcal = itemNutrient(item, "kcal");
  const { name, base } = item.snapshot;
  const closeDialog = (open: boolean) => !open && setDialog(null);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        <p className="mb-1.5 text-xs text-muted-foreground tabular">
          {item.portion
            ? `${formatNumber(item.portion.count)} × ${item.portion.name} · ${formatNumber(item.amount)} ${base}`
            : `${formatNumber(item.amount)} ${base}`}
        </p>
        <MacroChips
          protein={itemNutrient(item, "protein")}
          carbs={itemNutrient(item, "carbs")}
          fat={itemNutrient(item, "fat")}
        />
      </div>
      <p className="text-right tabular">
        <span className="block font-display text-lg font-bold">
          {kcal === null ? "—" : formatNutrient("kcal", kcal, false)}
        </span>
        <span className="text-xs text-muted-foreground">kcal</span>
      </p>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem onSelect={() => setDialog("edit")}>
            <Pencil className="h-4 w-4" /> Editar quantidade
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("move")}>
            <ArrowRightLeft className="h-4 w-4" /> Mover para outra refeição
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            disabled={removeItem.isPending}
            onSelect={() =>
              removeItem.mutate(
                { mealId: meal.id, itemId: item.id },
                {
                  onSuccess: () => toast.success(`${name} removido`),
                  onError: () => toast.error("Não foi possível remover o alimento."),
                },
              )
            }
          >
            <X className="h-4 w-4" /> Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditItemDialog open={dialog === "edit"} onOpenChange={closeDialog} mealId={meal.id} item={item} />
      <MoveItemDialog
        open={dialog === "move"}
        onOpenChange={closeDialog}
        mealId={meal.id}
        date={meal.date}
        item={item}
      />
    </li>
  );
}
