import { Archive, ArchiveRestore, Copy, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { fromPer100 } from "@/domain/nutrition/foods";
import type { Food } from "@/domain/nutrition/types";
import { useDeleteFood, useDuplicateFood, useSetArchived, useSetFavorite } from "@/features/foods/api";
import { formatNumber, formatNutrient } from "@/lib/format";
import { cn } from "@/lib/utils";

import { FoodDialog, type FoodDialogMode } from "./food-dialog";

export function FoodCard({ food, used }: { food: Food; used: boolean }) {
  const [dialog, setDialog] = useState<FoodDialogMode | "delete" | null>(null);
  const setFavorite = useSetFavorite();
  const setArchived = useSetArchived();
  const duplicate = useDuplicateFood();
  const deleteFood = useDeleteFood();
  // Valores na quantidade em que o alimento foi cadastrado (ex.: por 35 g).
  const p = fromPer100(food.per100, food.baseAmount);

  const fail = (msg: string) => () => toast.error(msg);

  function toggleArchived() {
    setArchived.mutate(
      { foodId: food.id, archived: !food.archived },
      {
        onSuccess: () =>
          toast.success(food.archived ? `${food.name} restaurado` : `${food.name} arquivado`, {
            description: food.archived ? undefined : "Some da busca de registro; o histórico continua igual.",
          }),
        onError: fail("Não foi possível alterar o alimento."),
      },
    );
  }

  return (
    <li className="flex flex-col surface p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <button
          className="min-w-0 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => setDialog("view")}
        >
          <span className="block text-xs font-medium text-muted-foreground">
            {food.category ?? "Sem categoria"}
          </span>
          <span className="block truncate font-display text-lg font-bold hover:underline">{food.name}</span>
          <span className="block truncate text-sm text-muted-foreground">{food.brand ?? "Sem marca"}</span>
        </button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={food.favorite}
            aria-label={food.favorite ? `Remover ${food.name} dos favoritos` : `Favoritar ${food.name}`}
            disabled={setFavorite.isPending}
            onClick={() =>
              setFavorite.mutate(
                { foodId: food.id, favorite: !food.favorite },
                { onError: fail("Não foi possível atualizar o favorito.") },
              )
            }
          >
            <Star className={cn(food.favorite ? "fill-carbs text-carbs" : "text-muted-foreground")} />
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${food.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onSelect={() => setDialog("edit")}>
                <Pencil className="h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={duplicate.isPending}
                onSelect={() =>
                  duplicate.mutate(food.id, {
                    onSuccess: (copy) => toast.success(`${copy.name} criado`),
                    onError: fail("Não foi possível duplicar o alimento."),
                  })
                }
              >
                <Copy className="h-4 w-4" /> Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={toggleArchived} disabled={setArchived.isPending}>
                {food.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {food.archived ? "Restaurar" : "Arquivar"}
              </DropdownMenuItem>
              {!used && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onSelect={() => setDialog("delete")}>
                    <Trash2 className="h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="mt-4 flex items-baseline gap-1.5 tabular">
        <span className="font-display text-3xl font-bold">
          {p.kcal == null ? "—" : formatNutrient("kcal", p.kcal, false)}
        </span>
        <span className="text-sm text-muted-foreground">
          kcal / {formatNumber(food.baseAmount)} {food.base}
        </span>
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm tabular">
        <Macro label="Prot." value={p.protein} tone="bg-protein-soft" />
        <Macro label="Carb." value={p.carbs} tone="bg-carbs-soft" />
        <Macro label="Gord." value={p.fat} tone="bg-fat-soft" />
      </dl>

      {food.portions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-3">
          {food.portions.map((po) => (
            <span key={po.id} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular">
              {po.name} = {formatNumber(po.amount)} {food.base}
            </span>
          ))}
        </div>
      )}

      <FoodDialog
        open={dialog === "view" || dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(null)}
        mode={dialog === "edit" ? "edit" : "view"}
        food={food}
      />
      <AlertDialog open={dialog === "delete"} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {food.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Este alimento nunca foi registrado, então nenhum histórico é afetado. A exclusão não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteFood.mutate(food.id, {
                  onSuccess: () => toast.success(`${food.name} excluído`),
                  onError: (e) => toast.error(e.message || "Não foi possível excluir o alimento."),
                })
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function Macro({ label, value, tone }: { label: string; value: number | null | undefined; tone: string }) {
  return (
    <div className={cn("rounded-xl px-2.5 py-2", tone)}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value == null ? "—" : `${formatNumber(value)} g`}</dd>
    </div>
  );
}
